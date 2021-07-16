import kotlinx.css.*
import kotlinx.css.properties.*
import kotlinx.html.Draggable
import kotlinx.html.draggable
import kotlinx.html.js.onDragStartFunction
import react.RProps
import react.child
import react.functionalComponent
import react.useContext
import styled.StyleSheet
import styled.css
import styled.styledLi
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
    val hover by css {
        hover {
            top = (-40).px
            cursor = Cursor.pointer
            boxShadowInset(Color("rgb(150 100 50 / 30%)"), 0.px, 0.px, 80.px)
            boxShadow(Color("rgb(255 255 200 / 80%)"), 0.px, 0.px, 30.px)
        }
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

    val context = useContext(DragDropContext)

    styledUl {
        css {
            +HandAreaClasses.root
            height = 6.rem
            marginTop = (-8).rem

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

        for (tcard in props.cards) {
            styledLi {
                attrs {
                    css {
                        width = 8.rem
                        height = 11.2.rem
                        listStyleType = ListStyleType.none
                        +PokerCardClasses.root
                        +HandAreaClasses.hover
                    }
                    draggable = Draggable.htmlTrue
                    onDragStartFunction = {
                        context.drag(tcard)
                    }
                }
                child(PokerCard) {
                    key = "${tcard.suit}${tcard.rank}"
                    attrs {
                        card = tcard
                    }
                }
            }
        }
    }
}
