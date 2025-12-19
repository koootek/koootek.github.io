function createElements() {
    const audioPlayer = document.createElement("audio");
    audioPlayer.id = "audioPlayer";

    const audioPlayerBar = document.createElement("div");
    audioPlayerBar.id = "audioPlayerBar";
    const audioIcon = document.createElement("img");
    audioIcon.alt = "audio icon";
    const audioInfo = document.createElement("div");
    const audioInfoTitle = document.createElement("h4");
    audioInfoTitle.innerText = "Title";
    const audioInfoAuthor = document.createElement("h5");
    audioInfoAuthor.innerText = "Author";
    audioInfo.appendChild(audioInfoTitle);
    audioInfo.appendChild(audioInfoAuthor);
    const audioVolume = document.createElement("input");
    audioVolume.id = "volume";
    audioVolume.type = "range";
    audioVolume.value = "50";
    audioVolume.step = "1";
    audioVolume.min = "0";
    audioVolume.max = "100";
    const audioTimeline = document.createElement("input");
    audioTimeline.id = "timeline";
    audioTimeline.type = "range";
    audioTimeline.value = "0";
    audioTimeline.step = "1";
    const audioControls = document.createElement("div");
    const qualityControl = document.createElement("img");
    qualityControl.id = "quality";
    qualityControl.src = "assets/icons/highquality.svg";
    qualityControl.title = "change quality";
    qualityControl.alt = "change quality icon";
    const previousControl = document.createElement("img");
    previousControl.id = "previous";
    previousControl.src = "assets/icons/previous.svg";
    previousControl.title = "previous track";
    previousControl.alt = "previous track icon";
    const playbackControl = document.createElement("img");
    playbackControl.id = "playback";
    playbackControl.src = "assets/icons/play.svg";
    playbackControl.title = "playback";
    playbackControl.alt = "playback icon";
    const nextControl = document.createElement("img");
    nextControl.id = "next";
    nextControl.src = "assets/icons/next.svg";
    nextControl.title = "next track";
    nextControl.alt = "next track icon";

    audioControls.appendChild(qualityControl);
    audioControls.appendChild(previousControl);
    audioControls.appendChild(playbackControl);
    audioControls.appendChild(nextControl);

    audioPlayerBar.appendChild(audioIcon);
    audioPlayerBar.appendChild(audioInfo);
    audioPlayerBar.appendChild(audioVolume);
    audioPlayerBar.appendChild(audioTimeline);
    audioPlayerBar.appendChild(audioControls);

    document.body.appendChild(audioPlayer);
    document.body.appendChild(audioPlayerBar);
}

createElements();

const audioPlayer = document.getElementById("audioPlayer");
const audioPlayerBar = document.getElementById("audioPlayerBar");

const audioPlayerBarComponents = Object.freeze({
    icon: audioPlayerBar.querySelector("img"),
    title: audioPlayerBar.querySelector("h4"),
    author: audioPlayerBar.querySelector("h5"),
});

const controlButtons = Object.freeze({
    playback: document.getElementById("playback"),
    previous: document.getElementById("previous"),
    next: document.getElementById("next"),
    timeline: document.getElementById("timeline"),
    volume: document.getElementById("volume"),
    quality: document.getElementById("quality"),
});

class AudioController {
    #currentTrack = 0;
    #playing = false;
    #paused = false;
    #soundtracks;
    autoplay = true; // unhandled
    highQuality = true;

    constructor(soundtracks) {
        this.#soundtracks = soundtracks;
        this.#updateTrackDisplay();
        this.currentTrack.load(this.highQuality);
        setInterval(() => {
            controlButtons.timeline.value = audioPlayer.currentTime;
            if (audioPlayer.ended && this.autoplay)
                this.nextTrack();
        }, 100);
    }

    get currentTrack() {
        return this.#soundtracks[this.#currentTrack];
    }

    get playing() {
        return this.#playing;
    }

    get paused() {
        return this.#paused;
    }

    #moveTrack(incrementCallback) {
        incrementCallback();
        this.#updateTrackDisplay();
        this.#playing = false;
        this.#paused = false;
        this.currentTrack.load(this.highQuality);
        if (this.autoplay) {
            this.play();
            controlButtons.playback.src = "assets/icons/pause.svg";
        }
        else
            controlButtons.playback.src = "assets/icons/play.svg";
    }

    nextTrack() {
        this.#moveTrack(() => {
            this.#currentTrack++;
            if (this.#currentTrack >= this.#soundtracks.length)
                this.#currentTrack = 0;
        });
    }

    previousTrack() {
        if (audioPlayer.currentTime > 5) {
            audioPlayer.currentTime = 0;
            return;
        }

        this.#moveTrack(() => {
            this.#currentTrack--;
            if (this.#currentTrack < 0)
                this.#currentTrack = this.#soundtracks.length - 1;
        });
    }

    play() {
        if (this.#paused && audioPlayer.paused) {
            audioPlayer.play();
            this.#paused = false;
        }

        if (this.#playing) {
            return;
        }

        this.currentTrack.play();
        this.#playing = true;
        this.setVolume(controlButtons.volume.value / 100);
    }

    pause() {
        if (!this.#playing || this.#paused)
            return;

        audioPlayer.pause();
        this.#paused = true;
    }

    setProgress(newTime) {
        audioPlayer.currentTime = newTime;
    }

    setVolume(newVolume) {
        audioPlayer.volume = Math.min(Math.max(newVolume, 0.0), 1.0);
    }

    #updateTrackDisplay() {
        audioPlayerBarComponents.icon.src = `assets/images/${this.currentTrack.iconPath}`;
        audioPlayerBarComponents.title.innerText = this.currentTrack.title;
        audioPlayerBarComponents.author.innerText = this.currentTrack.author;
    }

    changeQuality() {
        audioController.highQuality = !audioController.highQuality;
        audioController.saveData();
        if (audioController.highQuality)
            controlButtons.quality.src = "assets/icons/highquality.svg";
        else
            controlButtons.quality.src = "assets/icons/lowquality.svg";
        let currentTime = audioPlayer.currentTime;
        audioController.currentTrack.load(this.highQuality);
        audioPlayer.currentTime = currentTime;
        if (audioController.playing && !audioController.paused)
            audioPlayer.play();
    }

    loadData() {
        let trackCookie = readCookie("track");
        let track = trackCookie == null ? 0 : parseInt(trackCookie);
        let trackProgressCookie = readCookie("trackProgress");
        let trackProgress = trackProgressCookie == null ? 0 : parseFloat(trackProgressCookie);
        let highQualityCookie = readCookie("highQuality");
        let highQuality = highQualityCookie == null ? true : highQualityCookie === "true";
        let audioVolumeCookie = readCookie("audioVolume");
        let audioVolume = audioVolumeCookie == null ? 0.5 : parseFloat(audioVolumeCookie);

        this.#currentTrack = track;
        this.#updateTrackDisplay();
        if (this.highQuality != highQuality)
            this.changeQuality();
        this.setProgress(trackProgress);
        this.setVolume(audioVolume);
    }

    saveData() {
        writeCookie("track", this.#currentTrack);
        writeCookie("trackProgress", audioPlayer.currentTime);
        writeCookie("highQuality", this.highQuality);
        writeCookie("audioVolume", audioPlayer.volume);
    }
}

class Soundtrack {
    constructor(title, author, iconPath, trackPath) {
        this.title = title;
        this.author = author;
        this.iconPath = iconPath;
        this.trackPath = trackPath;
    }

    load(highQuality) {
        if (highQuality)
            audioPlayer.src = `assets/music/${this.trackPath}`;
        else
            audioPlayer.src = `assets/music/${this.trackPath}`.replace(".mp3", "-low.mp3");
        audioPlayer.load();
    }

    play() {
        audioPlayer.play();
    }
}

// Tracks available to user
const audioController = new AudioController([
    new Soundtrack("Merry Christmas", "AI West", "merrychristmas.png", "merrychristmas.mp3"),
    new Soundtrack("DJ MELON (NeckHurts)", "Rootshay", "neckhurts.jpg", "neckhurts.mp3"),
    new Soundtrack("HH (Chrisitan Version)", "Kayne West (spring)", "holy.jpg", "ye_heiljesus.mp3"),
    new Soundtrack("HH", "Kayne West", "hh.jpg", "ye_hh.mp3"),
    new Soundtrack("Krzycze głośno", "Unknown", "jew.jpg", "krzyczeglosno.mp3"),
    new Soundtrack("Nie mogę oddychać", "Grzesiek Floryda 997", "grzegooorzu.jpg", "grzesio.mp3"),
    new Soundtrack("RU_BOOTLEG", "ilyhiryu", "bootleg.jpg", "ru_bootleg.mp3"),
    new Soundtrack("WE ARE CHARLIE KIRK", "Unknown", "wearecharlie.png", "wearecharlie.mp3"),
]);
audioController.loadData();

audioPlayer.addEventListener("loadedmetadata", () => {
    controlButtons.timeline.max = audioPlayer.duration;
});

controlButtons.playback.addEventListener("click", () => {
    if (audioController.playing && !audioController.paused) {
        audioController.pause();
        controlButtons.playback.src = "assets/icons/play.svg";
    } else {
        audioController.play();
        controlButtons.playback.src = "assets/icons/pause.svg";
    }
});
controlButtons.previous.addEventListener("click", () => {
    audioController.previousTrack();
    audioController.saveData();
});
controlButtons.next.addEventListener("click", () => {
    audioController.nextTrack();
    audioController.saveData();
});
controlButtons.timeline.addEventListener("input", () => {
    audioController.setProgress(controlButtons.timeline.value);
    audioController.saveData();
});
controlButtons.volume.addEventListener("mousemove", () => {
    audioController.setVolume(controlButtons.volume.value / 100);
    audioController.saveData();
});
controlButtons.quality.addEventListener("click", () => {
    audioController.changeQuality();
    audioController.saveData();
});
