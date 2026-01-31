# 🎤 ConfidenceMirror  
AI-Powered Presentation & Speech Alignment Platform

> Konuşmanı değil, mesajını güçlendir.

ConfidenceMirror, kullanıcıların ses kayıtlarını, sunum dosyalarını (PPTX) ve konuşma içeriklerini analiz ederek; konuşmanın sunum içeriğiyle ne kadar uyumlu olduğunu, hitabet kalitesini, tempo, vurgu ve duygu tonunu değerlendiren yapay zekâ destekli bir web platformudur.

Bu proje; sunum yapan öğrenciler, hackathon / ideathon katılımcıları, eğitmenler ve topluluk önünde konuşan herkes için prova ve objektif geri bildirim ihtiyacını çözmeyi hedefler.

---

## 🎯 Problem Tanımı

Birçok kişi sunum öncesinde:
- Sunum içeriği ile konuşma akışı arasında kopukluk yaşayabiliyor
- Ne anlattığından çok nasıl anlattığını fark edemiyor
- Ses tonu, vurgu, hız ve netlik konusunda objektif geri bildirim alamıyor
- Profesyonel bir konuşma koçuna erişemiyor

ConfidenceMirror, bu problemleri yapay zekâ destekli analiz ve yapılandırılmış geri bildirim ile çözer.

---

## 💡 ConfidenceMirror Ne Sunar?

- Konuşma ve ses analizi
- Sunum – konuşma uyum kontrolü
- Hitabet, hız, vurgu ve telaffuz değerlendirmesi
- Yapay zekâ destekli, anlaşılır ve uygulanabilir geri bildirim
- Slayt bazlı analiz ve öneriler

İnsan karar verir, AI hızlandırır.

---

## ✨ Özellikler

### 🎙️ Konuşma & Ses Analizi
- Konuşma hızı (yavaş / ideal / hızlı)
- Vurgu ve duraklama analizi
- Telaffuz ve netlik değerlendirmesi
- Duygu tonu analizi (confidence, neutral, stress vb.)

### 📑 İçerik – Konuşma Uyumu
- Konuşma, slayt başlıklarıyla örtüşüyor mu?
- Gereksiz sapmalar var mı?
- Ana mesaj yeterince vurgulanmış mı?
- Slayt bazlı eksik veya güçlendirilmesi gereken noktalar

### 🤖 Yapay Zekâ Destekli Geri Bildirim
- Google Gemini API kullanımı
- Yapılandırılmış JSON çıktılar
- Slayt özelinde talking points önerileri
- Net, sade ve aksiyon alınabilir analiz

---

## 🧩 Teknik Mimari

ConfidenceMirror, frontend, backend ve AI servisleri ayrımıyla tasarlanmış modüler bir mimariye sahiptir.

### Backend
- Python & FastAPI
- Ses işleme ve STT (speech-to-text)
- Sunum (PPTX) ayrıştırma
- Konuşma – içerik uyum analizi
- Gemini AI ile geri bildirim üretimi

### Frontend
- React + Vite
- Tailwind CSS
- Dosya yükleme ve ses kaydı
- Analiz sonuçlarını görselleştirme

---

## 📁 Proje Dosya Yapısı

confidence-mirror/

backend/
- main.py
- alignment.py
- slide_alignment.py
- talking_points.py
- audio_utils.py
- stt.py
- llm_feedback.py
- metrics.py
- pptx_parser.py
- file_utils.py
- models.py
- config.py
- requirements.txt

frontend/
- src/
  - api.js
  - App.jsx
  - main.jsx
  - Recorder.jsx
  - OutlineInput.jsx
  - Results.jsx
- index.html
- tailwind.config.js
- vite.config.js
- package.json

venv/
.gitignore
README.md

---

## 🧠 Analiz Süreci

1. Kullanıcı ses kaydını ve sunum dosyasını yükler
2. Backend ses ve slayt içeriğini işler
3. Konuşma metni çıkarılır
4. Slayt – konuşma uyumu analiz edilir
5. Gemini AI üzerinden geri bildirim üretilir
6. Kullanıcıya detaylı analiz raporu sunulur

---

## ⚙️ Kurulum

### Backend

git clone https://github.com/Melikeacar/confidence-mirror.git  
cd confidence-mirror  

python -m venv venv  
source venv/bin/activate  
pip install -r backend/requirements.txt  

uvicorn backend.main:app --reload  

Backend varsayılan adres:  
http://127.0.0.1:8000

---

### Frontend

cd frontend  
npm install  
npm run dev  

Frontend varsayılan adres:  
http://localhost:5173

---

## 🔐 Ortam Değişkenleri

Backend için .env dosyası oluşturun:

GEMINI_API_KEY=your_api_key_here

---

## 🌐 Proje Durumu

- Web tabanlı
- Public repository
- MVP tamamlandı
- Geliştirmeye açık

---

## 🚀 Gelecek Planları

- Video ve beden dili analizi
- Kullanıcı gelişim takibi
- AI Coach modu
- Kurumsal ve eğitim odaklı dashboard

---

## 👩‍💻 Geliştirici

Melike Acar  
Computer Engineering Student | AI & Cloud Enthusiast  
Huawei Cloud Trainer • Hackathon & Ideathon Participant  

---

Eğer bu proje faydalıysa repo’ya yıldız bırakmayı unutma ⭐
