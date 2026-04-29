const startRender = async () => {
  setIsRendering(true);
  const processedScenes = [];

  for (const [index, scene] of scenes.entries()) {
    setRenderStage({ message: `Processing Scene ${index + 1}...`, progress: (index / scenes.length) * 80 });

    // 1. Generate the Clear Voice
    const voiceRes = await fetch("/api/speech", { 
      method: "POST", 
      body: JSON.stringify({ text: scene.scriptText, voice: scene.selectedVoice }) 
    });
    const audioBlob = await voiceRes.blob();

    // 2. Get the Visual (AI or Upload)
    let visualUrl = scene.localFileUrl;
    if (scene.type === "ai") {
      const videoRes = await fetch("/api/generate-video", { 
        method: "POST", 
        body: JSON.stringify({ prompt: scene.visualPrompt }) 
      });
      const data = await videoRes.json();
      visualUrl = data.videoUrl;
    }

    processedScenes.push({ visualUrl, audioUrl: URL.createObjectURL(audioBlob) });
  }

  // 3. FINAL MIXING STAGE
  setRenderStage({ message: "Mixing Masterpiece & Ducking Audio...", progress: 90 });
  
  const finalRes = await fetch("/api/render-final", {
    method: "POST",
    body: JSON.stringify({ scenes: processedScenes }),
  });

  const finalMovieBlob = await finalRes.blob();
  const finalUrl = URL.createObjectURL(finalMovieBlob);

  // 4. DOWNLOAD READY
  setIsRendering(false);
  setRenderStage(null);
  
  // Automatically trigger download
  const a = document.createElement("a");
  a.href = finalUrl;
  a.download = "studio-nexus-masterpiece.mp4";
  a.click();
};
