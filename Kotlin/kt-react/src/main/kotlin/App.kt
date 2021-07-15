import kotlinx.browser.window
import kotlinx.coroutines.*
import react.*
import react.dom.div
import react.dom.h3

val App = functionalComponent<RProps> {
    var unwatchedVideos by useState<List<Video>>(emptyList())
    val (currentVideo, setCurrentVideo) = useState<Video?>(null)
    var currentHandCards by useState<List<Card>>(emptyList())
    val (_, drawCard, loading) = useDeck()

    useEffectWithCleanup(emptyList()) {
        val job = MainScope().launch {
            fetchVideos().also {
                unwatchedVideos = it
            }
        };

        { job.cancel() }
    }

    useEffect(listOf(loading)) {
        if(!loading) {
            currentHandCards = drawCard(9)
        }
    }

    div {
        h3 {
            +"Videos to watch"
        }
        videoList {
            videos = unwatchedVideos
            selectedVideo = currentVideo
            onSelectVideo = { video ->
                setCurrentVideo(video)
            }
        }

        h3 {
            +"Videos watched"
        }
    }
    child(Field) {}
    child(HandArea) {
        attrs.cards = currentHandCards
    }
    currentVideo?.let {
        videoPlayer {
            video = it
            unwatchedVideo = it in unwatchedVideos
            onWatchedButtonPressed = {
                if (video in unwatchedVideos) {
                    unwatchedVideos -= video
                } else {
                    unwatchedVideos += video
                }
            }
        }
    }
}

suspend fun fetchVideo(id: Int): Video {
    val response = window
        .fetch("https://my-json-server.typicode.com/kotlin-hands-on/kotlinconf-json/videos/$id")
        .await()
        .json()
        .await()
    return response as Video
}

suspend fun fetchVideos(): List<Video> = coroutineScope {
    (1..25).map { id ->
        async {
            fetchVideo(id)
        }
    }.awaitAll()
}
