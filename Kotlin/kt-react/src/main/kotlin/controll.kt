import kotlinx.coroutines.MainScope
import kotlinx.coroutines.launch
import react.createContext
import react.useEffectWithCleanup
import react.useState

fun initCards(): List<Card> {
    var cards: List<Card> = listOf()

    for (rank in PokerRank.values()) {
        for (suit in PokerSuit.values()) {
            if (rank == PokerRank.Joker && (suit == PokerSuit.Spades || suit == PokerSuit.Diamonds))
                continue

            cards += CardData(suit, rank)
        }
    }

    return cards.shuffled()
}


fun useDeck(): Triple<List<Card>, (Int) -> List<Card>, Boolean> {
    val (cardsInDeck, updateCardsInDeck) = useState(emptyList<Card>())
    val (loading, setLoading) = useState(true)

    val drawCard = { i: Int ->
        val trueSize = when {
            i < 1 -> 1
            i > cardsInDeck.size -> cardsInDeck.size
            else -> i
        }

        val cards = cardsInDeck.subList(0, trueSize)
        updateCardsInDeck(cardsInDeck - cards)

        cards
    }

    useEffectWithCleanup(emptyList()) {
        setLoading(true)
        val job = MainScope().launch {
            initCards().also {
                updateCardsInDeck(it)
            }
            setLoading(false)
        };

        { job.cancel(); }
    }

    return Triple(cardsInDeck, drawCard, loading)
}

data class CardDragDrop(
    val card: Card?,
    val drag: (Card) -> Unit,
    val drop: (Int) -> Card?,
)

val DragDropContext = createContext<CardDragDrop>()

data class CardDeck(val draw: (Int) -> Unit)

val CardDeckContext = createContext<CardDeck>()

fun initFieldRole(index: Int, card: Card): Boolean {
    if (listOf(9, 10, 11, 16, 17, 18, 23, 24, 25).indexOf(index) < 0) return false
    if (card.rank.ordinal > PokerRank.C10.ordinal) return false

    return true
}
