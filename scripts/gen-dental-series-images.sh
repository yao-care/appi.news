#!/usr/bin/env bash
# 一次生成「口腔健康衛教系列」四篇的全部配圖（12 內文圖 + 4 封面）。
# 在有金鑰的環境（伺服器 /root/appi.news，.env 含圖庫/AI 生圖金鑰）執行：
#   bash scripts/gen-dental-series-images.sh
# 規則：概念/物件圖走圖庫優先（--query 英文關鍵字）；人物圖用 --people（模組強制台灣人臉孔）。
# 生完自行檢查 public/images 與 public/covers 下 16 個 webp 都在，再 build/check:links/merge。
# 這是一次性腳本，合併進 main 前可 git rm 移除。
set -euo pipefail
cd "$(dirname "$0")/.."

gi() { node scripts/get-image.mjs "$@"; }

echo "== 封面 (4) =="
gi --topic "牙醫師以超音波器械為民眾洗牙、清除牙結石" --context "健保洗牙迷思破解" --people --out public/covers/dental-scaling-myths.webp
gi --topic "牙齦發炎與全身慢性病關聯的醫療概念" --context "牙周病與糖尿病心血管的關係" --query "gum inflammation systemic health medical concept" --out public/covers/gum-disease-whole-body.webp
gi --topic "家長協助幼兒以豌豆大小含氟牙膏刷牙" --context "含氟牙膏兒童防蛀與安全劑量" --people --out public/covers/fluoride-toothpaste-kids.webp
gi --topic "高齡長者在牙科接受口腔與咀嚼功能檢查" --context "缺牙失智與口腔衰弱" --people --out public/covers/tooth-loss-dementia.webp

echo "== dental-scaling-myths 內文 (3) =="
gi --topic "健保卡與牙科診間，象徵每半年一次健保洗牙給付" --context "健保洗牙給付規則" --query "health insurance card dental clinic reception" --out public/images/dental-scaling-myths-s1.webp
gi --topic "牙齒表面牙結石與牙菌斑堆積特寫" --context "牙結石如何形成、刷不掉" --query "dental calculus tartar plaque on teeth close up" --out public/images/dental-scaling-myths-s2.webp
gi --topic "健康牙齦與發炎牙齦對比" --context "洗牙流血多為既有牙齦發炎" --query "healthy versus inflamed gums gingivitis" --out public/images/dental-scaling-myths-s3.webp

echo "== gum-disease-whole-body 內文 (3) =="
gi --topic "牙周病分期，從牙齦炎到齒槽骨流失示意" --context "牙周病盛行率與分期" --query "periodontal disease stages gum bone loss diagram" --out public/images/gum-disease-whole-body-s1.webp
gi --topic "牙齒健康與心血管健康的概念連結" --context "牙周病與心血管相關而非因果" --query "oral health heart cardiovascular concept" --out public/images/gum-disease-whole-body-s2.webp
gi --topic "牙醫為患者進行牙周檢查與衛教" --context "健保牙周病統合照護計畫" --people --out public/images/gum-disease-whole-body-s3.webp

echo "== fluoride-toothpaste-kids 內文 (3) =="
gi --topic "不同濃度含氟牙膏產品" --context "1000-1500 ppm 含氟牙膏防蛀實證" --query "fluoride toothpaste tubes on shelf" --out public/images/fluoride-toothpaste-kids-s1.webp
gi --topic "牙刷上擠豌豆大小的牙膏用量" --context "分齡用量與氟中毒門檻換算" --query "pea size amount toothpaste on toothbrush" --out public/images/fluoride-toothpaste-kids-s2.webp
gi --topic "兒童在牙科診所接受專業塗氟" --context "台灣兒童免費塗氟補助" --people --out public/images/fluoride-toothpaste-kids-s3.webp

echo "== tooth-loss-dementia 內文 (3) =="
gi --topic "缺牙數量與認知、失智風險關聯的概念" --context "缺牙與失智相關、有假牙者風險接近常人" --query "elderly cognitive brain health memory concept" --out public/images/tooth-loss-dementia-s1.webp
gi --topic "口腔衰弱與身體衰弱、肌少症關聯的概念" --context "口腔衰弱是全身衰退前哨" --query "elderly frailty muscle weakness health concept" --out public/images/tooth-loss-dementia-s2.webp
gi --topic "長者配戴假牙、恢復咀嚼與咬合功能" --context "裝假牙補回咬合" --people --out public/images/tooth-loss-dementia-s3.webp

echo "== 完成。請確認 16 個 webp 皆生成： =="
ls -1 public/covers/{dental-scaling-myths,gum-disease-whole-body,fluoride-toothpaste-kids,tooth-loss-dementia}.webp
ls -1 public/images/{dental-scaling-myths,gum-disease-whole-body,fluoride-toothpaste-kids,tooth-loss-dementia}-s{1,2,3}.webp
