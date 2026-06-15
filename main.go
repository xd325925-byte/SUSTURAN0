package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/bwmarrin/discordgo"
)

func main() {
	token := os.Getenv("TOKEN")
	channelID := os.Getenv("CHANNEL_ID")
	port := os.Getenv("PORT") // Render portu otomatik verir
	if port == "" { port = "8080" }

	mesaj := "1NATL AS1N AN AN1ZIN AM 1NA KOYULA CAK XD"

	// 1. Discord Botunu Başlat
	dg, err := discordgo.New(token)
	if err != nil {
		log.Fatal(err)
	}

	go func() {
		err = dg.Open()
		if err != nil {
			log.Fatal("Discorda bağlanılamadı:", err)
		}
		log.Println("Bot başarıyla bağlandı!")

		for {
			dg.ChannelTyping(channelID)
			dg.ChannelMessageSend(channelID, mesaj)
			time.Sleep(5 * time.Second)
		}
	}()

	// 2. Web Sunucusunu Başlat (Render'ın servisi kapatmaması için)
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Bot aktif ve çalışıyor!")
	})

	log.Println("Sunucu başlatılıyor port:", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
