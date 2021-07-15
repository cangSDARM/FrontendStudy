import kotlinx.css.*
import kotlinx.css.properties.*
import kotlinx.html.Draggable
import kotlinx.html.draggable
import react.RProps
import react.dom.span
import react.functionalComponent
import styled.StyleSheet
import styled.css
import styled.styledLi
import styled.styledP

enum class PokerSuit(val displayName: String) {
    Clubs("2663"),
    Diamonds("2666"),
    Hearts("2665"),
    Spades("2660"),
}

enum class PokerRank {
    C2 {
        override fun toString(): String = "2"
    },
    C3 {
        override fun toString(): String = "3"
    },
    C4 {
        override fun toString(): String = "4"
    },
    C5 {
        override fun toString(): String = "5"
    },
    C6 {
        override fun toString(): String = "6"
    },
    C7 {
        override fun toString(): String = "7"
    },
    C8 {
        override fun toString(): String = "8"
    },
    C9 {
        override fun toString(): String = "9"
    },
    C10 {
        override fun toString(): String = "10"
    },
    Jack {
        override fun toString(): String = "J"
    },
    Queen {
        override fun toString(): String = "Q"
    },
    King {
        override fun toString(): String = "K"
    },
    Ace {
        override fun toString(): String = "A"
    },
    Joker,
}

external interface PokerCardProps : RProps {
    var suit: PokerSuit
    var rank: PokerRank
}

object PokerCardClasses : StyleSheet("poker-card", isStatic = true) {
    val pseudo by css {
        textAlign = TextAlign.center
        width = 1.em
        position = Position.absolute
        fontSize = 1.4.em
        lineHeight = LineHeight("0.85em")
        marginTop = 4.pct
        marginLeft = 0.pct
    }
    val hover by css {
        hover {
            top = (-40).px
            cursor = Cursor.pointer
            boxShadowInset(Color("rgb(150 100 50 / 30%)"), 0.px, 0.px, 80.px)
            boxShadow(Color("rgb(255 255 200 / 80%)"), 0.px, 0.px, 30.px)
        }
    }
    val root by css {
        top = 0.px
        left = 0.px
        listStyleType = ListStyleType.none
        backgroundColor = Color.white
        borderRadius = 15.px
        boxShadowInset(Color("rgb(150 100 50 / 50%)"), 0.px, 0.px, 80.px)
        boxShadow(Color("#966432"), 0.px, 0.px, 3.px)
        position = Position.absolute
        transition(delay = 0.1.s, duration = 0.5.s, property = "top", timing = Timing.ease)
        put("transform-style", "preserve-3d")
        put("backface-visibility", "hidden")

    }
    val content by css {
        width = 60.pct
        height = 75.pct
        left = 50.pct
        marginLeft = 25.px
        marginTop = 24.px
        color = Color.transparent
        border = "1px solid #000"
        backgroundPosition = "center"
        backgroundSize = "cover"
        userSelect = UserSelect.none
    }
}

val PokerCard = functionalComponent<PokerCardProps> { props ->

    styledLi {
        attrs {
            draggable = Draggable.htmlTrue
        }
        css {
            val isJoker = props.rank == PokerRank.Joker
            val contentOf = if (isJoker) props.rank.toString().quoted
            else "${props.rank} \\${props.suit.displayName}".quoted

            +PokerCardClasses.root
            +PokerCardClasses.hover
            width = 8.rem
            height = 11.2.rem
            color =
                if (props.suit == PokerSuit.Hearts || props.suit == PokerSuit.Diamonds) Color("#a00")
                else Color("#222")

            if (isJoker) put("writing-mode", "vertical-lr")

            before {
                +PokerCardClasses.pseudo
                content = contentOf
            }
            after {
                +PokerCardClasses.pseudo
                content = contentOf
                right = 0.px
                bottom = 4.pct
                transform { rotate(180.deg) }
            }
        }

        styledP {
            css { +PokerCardClasses.content }
            span { +props.suit.displayName }
            span { +props.rank.toString() }
        }
    }
}
