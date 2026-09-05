export function getCanvasPoint(
    canvas: HTMLCanvasElement,
    event: PointerEvent
): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect()

    return {
        x: (event.clientX - rect.left) * (canvas.width / rect.width),
        y: (event.clientY - rect.top) * (canvas.height / rect.height)
    }
}
