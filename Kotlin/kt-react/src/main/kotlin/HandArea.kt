import kotlinx.css.*
import kotlinx.css.properties.deg
import kotlinx.css.properties.rotate
import kotlinx.css.properties.transform
import kotlinx.css.properties.translate
import react.RProps
import react.child
import react.functionalComponent
import styled.StyleSheet
import styled.css
import styled.styledUl

external interface Card {
    val suit: PokerSuit
    val rank: PokerRank
}

data class CardData(
    override val suit: PokerSuit,
    override val rank: PokerRank,
) : Card

external interface HandAreaProps : RProps {
    var cards: List<Card>
}

private object HandAreaClasses : StyleSheet("hand-area", isStatic = true) {
    val root by css {
        position = Position.relative
        margin(horizontal = LinearDimension.auto)
        marginTop = 5.pct
        marginBottom = 10.pct
        listStyleType = ListStyleType.none
    }
}

data class Portal(val translateX: Double, val translateY: Double, val rotate: Double)

fun cardPortal(i: Int, size: Int): Portal {
    val startAngle = if (size > 10) -20.0 else -(size / 2.0 * 1.5)
    val offsetX = if (size > 10) 18.0 - size * 0.15 else 18.0
    val offsetY = 12.0

    return Portal(offsetX * i, offsetY + i, startAngle + 3 * (i - 1))
}

val HandArea = functionalComponent<HandAreaProps> { props ->

    styledUl {
        css {
            +HandAreaClasses.root
            position = Position.fixed
            height = 6.rem

            bottom = 0.px
            left = 50.pct

            children {
                for (i in 1..props.cards.size) {
                    nthChild(i.toString()) {
                        cardPortal(i, props.cards.size).let {
                            transform {
                                translate(it.translateX.px, it.translateY.px)
                                rotate(it.rotate.deg)
                            }
                        }
                    }
                }
            }
        }

        for (card in props.cards) {
            child(PokerCard) {
                key = "${card.suit}${card.rank}"
                attrs {
                    suit = card.suit
                    rank = card.rank
                }
            }
        }
    }
}
