import kotlinx.browser.window
import kotlinx.coroutines.*
import react.*
import react.dom.div
import react.dom.h3

val App = functionalComponent<RProps> {
    var unwatchedVideos by useState<List<Video>>(emptyList())
    val currentVideo by useState<Video?>(null)
    var currentHandCards by useState<List<Card>>(emptyList())
    val (_, drawCard, loading) = useDeck()
    val (currentDragDropCard, setCurrentDraDropCard) = useState<Card?>(null)

    val drag = { card: Card ->
        setCurrentDraDropCard(card)
    }
    val drop = fun(index: Int): Card? {
        return if (currentDragDropCard != null && initFieldRole(index, currentDragDropCard)) {
            val cdd = currentDragDropCard
            currentHandCards -= cdd
            setCurrentDraDropCard(null)

            cdd
        } else null
    }

    useEffectWithCleanup(emptyList()) {
        val job = MainScope().launch {
            fetchVideos().also {
                unwatchedVideos = it
            }
        };

        { job.cancel() }
    }

    useEffect(listOf(loading)) {
        if (!loading) {
            currentHandCards = drawCard(9)
        }
    }

    div {
        h3 {
            +"Videos to watch"
        }

        h3 {
            +"Videos watched"
        }
    }
    DragDropContext.Provider(CardDragDrop(currentDragDropCard, drag, drop)) {
        CardDeckContext.Provider(CardDeck(draw = {
            currentHandCards += drawCard(it)
        })) {
            child(Field) {}
        }
        child(HandArea) {
            attrs.cards = currentHandCards
        }
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
