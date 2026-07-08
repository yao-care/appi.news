---
title: "Linux 6.9 起 LUKS 待機不再清空加密金鑰：金鑰在記憶體躺了兩年，社群怎麼補"
slug: "luks-suspend-key-leak"
description: "從 Linux 6.9 開始，cryptsetup luksSuspend 不再可靠地把 LUKS 主金鑰從核心記憶體抹掉。這不是 cryptsetup 寫錯，而是核心 thread keyring 生命週期重構打破了一個舊約定，讓待機中的筆電把金鑰留在 RAM 兩年沒人發現。追這條根因，比記住『要升級』更有用。"
excerpt: "全碟加密的假設是：關機或待機後，金鑰不該還留在記憶體。Linux 6.9 悄悄打破了這個假設，而且是核心的錯、不是加密工具的錯。"
publishDate: "2026-08-10T08:00:00+08:00"
category: "tech"
subcategory: "digital-tools"
tags: ["LUKS", "磁碟加密", "Linux 核心", "資訊安全", "cryptsetup"]
coverImage: "covers/luks-suspend-key-leak.webp"
coverAlt: "象徵 LUKS 全碟加密金鑰在待機筆電記憶體中未被清除的資安風險示意"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "從 Linux 6.9（2024 年 5 月）起，cryptsetup luksSuspend 不再可靠地把 LUKS 主金鑰從核心記憶體抹掉，一份副本留在 RAM。"
  - "根因不在 cryptsetup，而在核心 thread keyring 生命週期的重構打破了『執行緒結束、金鑰就銷毀』這個舊約定；工具沒改，是它依賴的地基被抽掉了。"
  - "受影響的是待機（suspend-to-RAM）而非磁碟休眠：闔蓋睡覺的筆電仍通電，被拿走就能從記憶體抽出明文金鑰，這個洞躺了兩年才被 bisect 抓出來。"
references:
  - title: "Ingo Blechschmidt 的原始調查貼文（Mathstodon）"
    url: "https://mathstodon.xyz/@iblech/116769502749142438"
    publisher: "Mathstodon"
  - title: "Since Linux 6.9, LUKS suspend stopped wiping disk-encryption keys from memory"
    url: "https://discuss.privacyguides.net/t/since-linux-6-9-luks-suspend-stopped-wiping-disk-encryption-keys-from-memory/38949"
    publisher: "Privacy Guides Community"
  - title: "cryptsetup-luksSuspend(8) 手冊"
    url: "https://man.archlinux.org/man/cryptsetup-luksSuspend.8.en"
    publisher: "Arch Linux Manual Pages"
  - title: "dm-crypt — The Linux Kernel documentation"
    url: "https://docs.kernel.org/admin-guide/device-mapper/dm-crypt.html"
    publisher: "kernel.org"
  - title: "Seit Linux 6.9 löscht LUKS-Suspend die Verschlüsselungsschlüssel nicht mehr aus dem Speicher"
    url: "https://www.drweb.de/seit-linux-6-9-loescht-luks-suspend-die-verschluesselungsschluessel-nicht-mehr-aus-dem-speicher/"
    publisher: "Dr. Web"
originalContribution: "本文把這起事件拆成三層：luksSuspend 原本保證什麼、6.9 的 thread keyring 重構抽掉了哪一塊地基、以及為何『解錯題』是最大風險（全碟加密救不了通電待機的筆電），並補上台灣個人與企業裝置管理的具體因應順序。"
---

先講結論：如果你的 Linux 筆電用 LUKS 全碟加密，而且靠「闔蓋待機時把金鑰丟掉」來防被偷，那從 Linux 6.9（2024 年 5 月）開始，這層保護有兩年是失效的。`cryptsetup luksSuspend` 回報成功、金鑰卻還留在核心記憶體裡一份副本。問題不在 cryptsetup 寫錯，而在核心把它依賴的一個約定悄悄改掉了。這是一個典型的「工具沒動、地基被抽掉」的資安迴歸。

<img src="/images/luks-suspend-key-leak-s1.webp" width="867" height="1300" loading="lazy" decoding="async" alt="闔蓋待機中的筆電，記憶體仍通電，象徵金鑰滯留風險">

先把這個機制講清楚，不然很容易解錯題。[`cryptsetup luksSuspend` 的手冊寫得很白](https://man.archlinux.org/man/cryptsetup-luksSuspend.8.en)：它會暫停一個運作中的加密裝置（所有 I/O 會被擋住、無限等待），並「把加密金鑰從核心記憶體抹掉」。這個動作的用途很具體，不是拿來省電，是拿來防人。想像一台筆電闔蓋進入待機（suspend-to-RAM，記憶體持續通電、CPU 睡著），Debian 的 `cryptsetup-suspend` 這類設計會在睡著前主動呼叫 `luksSuspend`，把主金鑰從 RAM 清掉，等你回來輸入密碼再用 `luksResume` 補回去。這樣就算筆電在待機狀態被人拿走，記憶體裡也翻不出金鑰。

<img src="/images/luks-suspend-key-leak-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="加密金鑰與記憶體示意，象徵金鑰應在待機時被清除">

那 6.9 到底改了什麼？答案是核心 keyring 的生命週期被重構了。dm-crypt 這個底層加密模組，[可以把磁碟金鑰交給核心的 key retention service（keyring）保管](https://docs.kernel.org/admin-guide/device-mapper/dm-crypt.html)，用 `logon`、`user`、`encrypted`、`trusted` 幾種金鑰型別存在核心裡。`luksSuspend` 能把金鑰抹乾淨，靠的是一個很古老的保證：一個 thread keyring 會在持有它的那條執行緒結束時，連同裡面的金鑰一起被銷毀。[根據發現者 Ingo Blechschmidt 的調查](https://mathstodon.xyz/@iblech/116769502749142438)，6.9 對 keyring 生命週期的重構打破了這個保證，於是執行緒結束了、金鑰的副本卻沒跟著走，還躺在核心記憶體裡。cryptsetup 一行程式碼都沒改，它只是站在一塊被抽掉的地基上。

<img src="/images/luks-suspend-key-leak-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="Linux 核心原始碼與終端機除錯畫面，象徵以 git bisect 追出迴歸 commit">

這種 bug 特別難抓，因為每個環節都「回報成功」。Blechschmidt 是在整理一份 NixOS 腳本時覺得不對勁，才一路用核心 bisect（在版本區間裡二分搜尋，逐一編譯測試，把問題釘到某一個 commit）挖下去，花了好幾天才確認是 6.9 的那次重構。[這件事被彙整到 Privacy Guides 社群討論](https://discuss.privacyguides.net/t/since-linux-6-9-luks-suspend-stopped-wiping-disk-encryption-keys-from-memory/38949)後才擴散開來。換句話說，這個洞不是被攻擊者踩出來的，是被一個在做別的事、剛好夠龜毛的人撞出來的。沒有這種偶然，它大概還會再躺下去。

<img src="/images/luks-suspend-key-leak-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="電腦記憶體模組與主機板，象徵從待機裝置的 RAM 抽取金鑰的鑑識攻擊">

接著要踩一個剎車，因為很多人會把威脅想錯方向。這個洞影響的不是「關機後的磁碟」。機器關機、電斷了，RAM 內容很快消失，全碟加密照樣擋得住把硬碟拆去別的機器讀。真正出事的是**待機中、仍在通電**的筆電：它的記憶體是活的，本來該被清掉的金鑰卻還在。攻擊者只要拿到這台還亮著小燈的筆電，就能透過冷開機攻擊（趁 RAM 還沒斷電把內容 dump 出來）或 DMA 途徑（走 Thunderbolt／PCIe 直接讀記憶體），把明文金鑰撈出來。[德國媒體 Dr. Web 的報導](https://www.drweb.de/seit-linux-6-9-loescht-luks-suspend-die-verschluesselungsschluessel-nicht-mehr-aus-dem-speicher/)指出，這個狀態從 6.9 一路延續，等於「闔蓋就走人」的使用習慣被默默架空了兩年。全碟加密沒失效，失效的是你以為待機也安全的那個假設。

<img src="/images/luks-suspend-key-leak-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="開源開發者協作與程式碼審查示意，象徵核心與 cryptsetup 社群協力修補">

社群怎麼補？分兩線走，而且順序不能倒。第一線是核心端把 keyring 生命週期的行為改回「執行緒一結束、金鑰就確實銷毀」，把地基補回去；這是根因的解法。第二線是防迴歸：把「luksSuspend 後金鑰不該還在記憶體」寫成一個可自動跑的測試（NixOS 這邊已經加了對應測試），讓同樣的錯以後一改就被 CI 攔下來。這一步比修 bug 本身更重要。一個躺了兩年沒人發現的安全迴歸，代表當初根本沒有測試在盯這件事；只補程式碼、不補測試，下一次重構照樣會踩雷。開源的優勢從來不是「不會出錯」，而是出錯後有人能一路 bisect 追到底、還能把防線補在制度層。

<img src="/images/luks-suspend-key-leak-s6.webp" width="960" height="640" loading="lazy" decoding="async" alt="企業筆電資安管理示意，象徵台灣個人與組織的裝置因應">

台灣這邊該怎麼看？別急著只喊「快升級核心」，先分清楚你在防哪一類威脅。如果你的筆電裡有客戶個資、病歷、原始碼，威脅模型裡本來就該包含「裝置在待機狀態被偷或被短暫拿走」，那這條新聞對你就是真的。務實的因應有先後：一，把「闔蓋直接待機」改成敏感情境下走**磁碟休眠（hibernate）到加密磁碟或直接關機**，讓 RAM 斷電，這一步不必等核心修好就能自己做；二，開機層把 Secure Boot＋TPM 綁好，擋 evil-maid（趁你離開時動手腳）那一類攻擊；三，跟上發行版的核心更新，但把它當「補地基」而不是「唯一解」。對管一整批裝置的 IT 來說，重點不是這個 CVE 幾分，是你的裝置政策有沒有假設過「待機的筆電也可能落到別人手上」。看懂這條，比記住 6.9 這個版本號有用。

<h2>常見問題</h2>

<p><strong>Linux 6.9 這個 LUKS 問題，我關機還安全嗎？</strong><br>安全。這個洞只影響待機（suspend-to-RAM，記憶體持續通電）中的機器。機器一旦關機、電斷了，RAM 內容很快消失，全碟加密照常保護你的硬碟，就算硬碟被拆去別台機器也讀不出來。有風險的是闔蓋睡覺、還亮著燈的筆電。</p>

<p><strong>這是 cryptsetup 的漏洞還是 Linux 核心的問題？</strong><br>是核心的問題，不是 cryptsetup 寫錯。<a href="https://man.archlinux.org/man/cryptsetup-luksSuspend.8.en">luksSuspend 本來的職責</a>是暫停裝置並把金鑰從核心記憶體抹掉，它依賴核心「執行緒結束、thread keyring 就銷毀」的保證。<a href="https://mathstodon.xyz/@iblech/116769502749142438">6.9 對 keyring 生命週期的重構打破了這個保證</a>，工具本身沒動。</p>

<p><strong>我不等核心更新，現在能做什麼降風險？</strong><br>最直接的一步是別再靠待機：敏感情境下改成磁碟休眠（hibernate）或直接關機，讓 RAM 斷電。搭配 Secure Boot＋TPM 擋開機層的動手腳攻擊，再跟上發行版核心更新把根因補起來。這幾步不必等官方修好就能先做。</p>

<p><strong>一般個人使用者需要緊張嗎？</strong><br>要看威脅模型。這個攻擊需要實體接觸到你待機中的筆電，還要冷開機或 DMA 的手法。<a href="https://discuss.privacyguides.net/t/since-linux-6-9-luks-suspend-stopped-wiping-disk-encryption-keys-from-memory/38949">Privacy Guides 社群的討論</a>指出，最在意的是筆電容易被偷、裡面有高敏感資料的人。若你的資料被偷後果嚴重，就把待機習慣改掉；若只是家用桌機、幾乎不離身，風險相對低很多。</p>
