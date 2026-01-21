pluginManagement {
    repositories {
        maven { setUrl("https://maven.aliyun.com/repository/public") }
        maven { setUrl("https://dl.bintray.com/kotlin/kotlin-eap") }

        maven { setUrl("https://maven.aliyun.com/repository/public") }
        mavenCentral()

        maven { setUrl("https://maven.aliyun.com/repository/gradle-plugin") }
        maven { setUrl("https://plugins.gradle.org/m2/") }
    }
}
rootProject.name = "reactexplorer"
