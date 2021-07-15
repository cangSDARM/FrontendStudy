import kotlinx.css.*
import kotlinx.css.properties.*
import react.RProps
import react.functionalComponent
import styled.css
import styled.styledLi
import styled.styledSpan

val Deck = functionalComponent<RProps> {
    styledSpan {
        css {
            children {
                backgroundImage =
                    Image("url(\"http://chetart.com/blog/wp-content/uploads/2012/05/playing-card-back.jpg\")")
                backgroundColor = Color.gray
                backgroundPosition = "center"
                top = 0.px
                bottom = 0.px
                left = 0.px
                right = 0.px
                backgroundRepeat = BackgroundRepeat.noRepeat
                for (i in 1..3) {
                    nthChild((i + 1).toString()) {
                        transform {
                            translate((i * 2).px, (i * 2).px)
                        }
                        val invert = 4 - i
                        zIndex = invert
                        boxShadow(Color("#222e"), invert.px, invert.px, invert.px)
                    }
                }
            }
        }

        styledLi {
            css {
                +PokerCardClasses.root
                zIndex = 99
                transition(duration = 0.8.s)
                transform { translate(1.px, 1.px) }
                boxShadow(Color.transparent)

                hover {
                    transform {
                        rotateZ(15.deg)
                        translateX(20.px)
                    }
                    cursor = Cursor.pointer
                }
            }
        }

        for (i in 1..3) {
            styledLi {
                css(PokerCardClasses.root)
            }
        }
    }
}
