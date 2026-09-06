const stepsContainer = document.querySelector<HTMLElement>("#steps")
const steps = document.querySelectorAll<HTMLElement>(".step")
let activeStep: HTMLElement | null = null

function resizeStepsContainer(step: HTMLElement): void {
    if (!stepsContainer) return

    const stepHeight = step.getBoundingClientRect().height
    const containerBorderHeight =
        stepsContainer.offsetHeight - stepsContainer.clientHeight

    stepsContainer.style.height = `${stepHeight + containerBorderHeight}px`
    stepsContainer.scrollTop = 0
}

const resizeObserver = new ResizeObserver(() => {
    if (activeStep) resizeStepsContainer(activeStep)
})

export function showStep(stepName: string): void {
    const nextStep = document.querySelector<HTMLElement>(
        `.step[data-step="${stepName}"]`
    )

    if (!stepsContainer || !nextStep) return

    const previousStep = activeStep
    const shouldMoveFocus = previousStep !== null
        && previousStep.contains(document.activeElement)

    // Do not leave focus inside a section before marking it aria-hidden.
    if (shouldMoveFocus && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
    }

    activeStep = nextStep

    stepsContainer.classList.toggle("is-upload-step", stepName === "upload")

    for (const step of steps) {
        const isActive = step === nextStep

        step.classList.toggle("is-active", isActive)
        step.setAttribute("aria-hidden", String(!isActive))
    }

    resizeObserver.disconnect()
    resizeObserver.observe(nextStep)

    requestAnimationFrame(() => {
        resizeStepsContainer(nextStep)

        if (previousStep !== nextStep) {
            nextStep.scrollIntoView({
                behavior: "smooth",
                block: "start"
            })
        }

        if (shouldMoveFocus) {
            const focusTarget = nextStep.querySelector<HTMLElement>(
                "button, input, select, textarea, a[href], [tabindex]:not([tabindex=\"-1\"])"
            )

            if (focusTarget) {
                focusTarget.focus({ preventScroll: true })
            } else {
                nextStep.setAttribute("tabindex", "-1")
                nextStep.focus({ preventScroll: true })
            }
        }
    })
}
