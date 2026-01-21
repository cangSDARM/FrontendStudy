import kotlinx.css.*
import kotlinx.css.properties.*
import kotlinx.html.classes
import kotlinx.html.js.onDragEnterFunction
import kotlinx.html.js.onDragOverFunction
import kotlinx.html.js.onDropFunction
import org.w3c.dom.events.Event
import react.*
import react.dom.div
import styled.css
import styled.styledDiv

external interface FieldProps : RProps {}

val Field = functionalComponent<FieldProps> {


    div {
        attrs {
            classes += "perspective"
        }

        styledDiv {
            css {
                margin = "0 auto 10rem"
                position = Position.relative

                display = Display.grid
                gridTemplateColumns = GridTemplateColumns.repeat("7, 1fr")
                gap = Gap("3px 2px")
                width = LinearDimension.maxContent

                " > div, > span, > div > li" {
                    width = 6.rem
                    height = 8.4.rem
                    position = Position.relative
                    display = Display.inlineBlock
                }
                " > * > li" {
                    borderRadius = 12.px
                }
            }

            for (i in 0 until 42) {
                if (i != 35 &&
                    (i % 7 == 6 || i % 7 == 0 || i == 1 || i == 5 || i == 29 || i == 33 || i > 35)
                ) div { }
                else if (i == 35)
                    child(Deck) { }
                else
                    child(FieldItem) {
                        attrs { index = i }
                    }
            }
        }
    }
}

private interface FieldItemProps : RProps {
    var index: Int
}

private val FieldItem = functionalComponent<FieldItemProps> { props ->

    var theCard by useState<Card?>(null)

    val cancelDefault = { e: Event ->
        e.preventDefault()
        e.stopPropagation()
    }
    val context = useContext(DragDropContext)

    fun initField() {
        if (theCard == null)
            context.drop(props.index)?.let {
                theCard = it
            }
    }

    styledDiv {
        +props.index.toString()
        attrs {
            onDragOverFunction = {
                cancelDefault(it)
            }
            onDragEnterFunction = {
                cancelDefault(it)
            }
            onDropFunction = { e ->
                cancelDefault(e)
                initField()
            }
        }

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
        theCard?.let {
            child(PokerCard) {
                attrs { card = it }
            }
        }
    }
}
