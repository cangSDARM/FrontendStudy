import kotlinx.css.*
import kotlinx.css.properties.*
import kotlinx.html.classes
import react.RProps
import react.child
import react.dom.div
import react.functionalComponent
import styled.css
import styled.styledDiv

external interface FieldProps : RProps {}

val Field = functionalComponent<FieldProps> {

    div {
        attrs { classes += "perspective" }

        styledDiv {
            css {
                margin = "0 auto 10rem"
                position = Position.relative

                display = Display.grid
                gridTemplateColumns = GridTemplateColumns.repeat("7, 1fr")
                gap = Gap("3px 2px")
                width = LinearDimension.maxContent

                children {
                    width = 6.rem
                    height = 8.4.rem
                    position = Position.relative
                    display = Display.inlineBlock
                }
            }

            for (i in 0 until 42) {
                if (i != 35 &&
                    (i % 7 == 6 || i % 7 == 0 || i == 1 || i == 5 || i == 29 || i == 33 || i > 35)
                ) div { }
                else if (i == 35)
                    child(Deck) { }
                else
                    styledDiv {
                        +i.toString()

                        css {
                            position = Position.relative
                            display = Display.inlineBlock
                            backgroundColor = Color.gray
                            transition("all", 1.s)

                            hover {
                                cursor = Cursor.pointer
                                boxShadow(Color("rgb(0 0 0/50%)"), 2.px, 18.px, 6.px)
                                transform {
                                    translate3d(0.px, 0.px, 20.px)
                                }
                            }
                        }
                    }
            }
        }
    }
}
