import kotlinx.browser.document
import kotlinx.css.*
import kotlinx.css.properties.deg
import kotlinx.css.properties.rotateX
import kotlinx.css.properties.transform
import react.child
import react.dom.render
import styled.injectGlobal

val styles = CSSBuilder().apply {
    body {
        backgroundColor = Color("#eee")

        width = 100.vw
        overflowX = Overflow.hidden
    }
    "[draggable=\"true\"]" {
        userSelect = UserSelect.none
    }
    ".perspective" {
        put("perspective", "1000px")

        children {
            put("transform-style", "preserve-3d")
            transform {
                rotateX(32.deg)
            }
        }
    }
}

external interface Video {
    val id: Int
    val title: String
    val speaker: String
    val videoUrl: String
}

fun main() {
    injectGlobal(styles.toString())
    render(document.getElementById("root")) {
        child(App) { }
    }
}
