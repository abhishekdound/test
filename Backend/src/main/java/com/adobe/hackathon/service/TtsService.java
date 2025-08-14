package com.adobe.hackathon.service;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import com.adobe.hackathon.util.HttpHelpers;

@Service
public class TtsService {
    private final String provider = System.getenv().getOrDefault("TTS_PROVIDER","azure");

    public String synthesize(String text){
        if (!"azure".equalsIgnoreCase(provider)) throw new RuntimeException("Only Azure TTS wired");
        String key = System.getenv("AZURE_TTS_KEY");
        String endpoint = System.getenv("AZURE_TTS_ENDPOINT"); // e.g. https://<region>.tts.speech.microsoft.com/cognitiveservices/v1
        byte[] mp3 = HttpHelpers.azureTts(endpoint, key, text, "en-US-JennyNeural");
        Path out = Paths.get("tts", UUID.randomUUID()+".mp3");
        try { Files.createDirectories(out.getParent()); Files.write(out, mp3); } catch(IOException ignored){}
        return "/tts/"+out.getFileName();
    }
}

