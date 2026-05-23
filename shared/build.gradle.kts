plugins {
    kotlin("multiplatform") version "2.0.0"
}

kotlin {
    androidTarget()
    iosX64()
    iosArm64()
    iosSimulatorArm64()

    sourceSets {
        val commonMain by getting {
            dependencies {
                // KMP Shared State & ViewModels
            }
        }
    }
}
