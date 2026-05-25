const express = require('express');
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot yazma özelliğiyle aktif!");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda dinleniyor.`);
});

// --- AYARLAR ---
const token = process.env.TOKEN;
const message1 = process.env.MESSAGE1;
const message2 = process.env.MESSAGE2;
const channels = [
  "1487991643461386391",
  "1490372219912716351",
  "1498820721928044614"
];

let currentChannelIndex = 0;
let currentMessageTurn = 1; // 1: message1, 2: message2

if (!token || !message1 || !message2) {
    console.error("HATA: TOKEN, MESSAGE1 veya MESSAGE2 eksik!");
} else {
    console.log("Bot başlatıldı!");
    console.log(`MESSAGE1: ${message1}`);
    console.log(`MESSAGE2: ${message2}`);
    console.log(`Kanallar: ${channels.join(", ")}`);
    // Döngüyü başlat
    setInterval(handleCycle, 5000);
}

async function handleCycle() {
  const currentChannelId = channels[currentChannelIndex];
  
  // Hangi mesajın gönderileceğini belirle
  const currentMessage = currentMessageTurn === 1 ? message1 : message2;
  const messageType = currentMessageTurn === 1 ? "MESSAGE1" : "MESSAGE2";

  try {
    // 1. Önce "Yazıyor..." animasyonunu gönder
    await axios.post(`https://discord.com/api/v9/channels/${currentChannelId}/typing`, {}, {
      headers: { "Authorization": token }
    });

    // 2. Kısa bir gecikme (Gerçekçi görünmesi için 1.5 saniye bekle ve mesajı at)
    setTimeout(() => {
      sendActualMessage(currentChannelId, currentMessage, messageType);
    }, 1500);

  } catch (err) {
    console.error(`❌ Typing hatası (${currentChannelId}):`, err.response?.status);
    // Hata olsa bile sırayı kaydır ki takılmasın
    currentMessageTurn === 1 ? currentMessageTurn = 2 : handleNextChannel();
  }
}

function sendActualMessage(channelId, message, messageType) {
  axios.post(`https://discord.com/api/v9/channels/${channelId}/messages`, {
    content: message
  }, {
    headers: {
      "Authorization": token,
      "Content-Type": "application/json"
    }
  }).then(() => {
    console.log(`✅ Mesaj Gönderildi: ${channelId} - ${messageType}: "${message}"`);
    
    // Mesaj sırasını kontrol et
    if (currentMessageTurn === 1) {
      // İlk mesaj gönderildi, şimdi ikinci mesajı gönderecek
      currentMessageTurn = 2;
    } else {
      // İkinci mesaj da gönderildi, bir sonraki kanala geç
      currentMessageTurn = 1;
      currentChannelIndex = (currentChannelIndex + 1) % channels.length;
      console.log(`➡️ ${channels[currentChannelIndex]} kanalına geçiliyor...`);
    }
    
  }).catch((err) => {
    console.error(`❌ Mesaj Hatası (${channelId} - ${messageType}):`, err.response?.status);
    
    // Hata durumunda da sırayı ilerlet
    if (currentMessageTurn === 1) {
      currentMessageTurn = 2;
    } else {
      currentMessageTurn = 1;
      currentChannelIndex = (currentChannelIndex + 1) % channels.length;
    }
  });
}

function handleNextChannel() {
  currentMessageTurn = 1;
  currentChannelIndex = (currentChannelIndex + 1) % channels.length;
}
