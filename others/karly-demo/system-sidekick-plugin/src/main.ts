import { showUI, on, emit } from '@create-figma-plugin/utilities'

export default function () {
  showUI({ width: 400, height: 600 })

  // Listen for component placement requests from the UI
  on('PLACE_COMPONENT', async (data: { componentKey: string; variant?: string }) => {
    try {
      const { componentKey, variant } = data

      // Import the component from the ShadCN Figma library
      const component = await figma.importComponentByKeyAsync(componentKey)
      const instance = component.createInstance()

      // Try to set variant if specified
      if (variant) {
        try {
          const props: Record<string, string> = {}
          props['Variant'] = variant
          instance.setProperties(props)
        } catch {
          // Variant property may not exist on this component — that's OK
        }
      }

      // Position near current selection, or at viewport center
      const selection = figma.currentPage.selection[0]
      if (selection) {
        instance.x = selection.x
        instance.y = selection.y + selection.height + 16
      } else {
        instance.x = figma.viewport.center.x - instance.width / 2
        instance.y = figma.viewport.center.y - instance.height / 2
      }

      // Select the new instance and scroll to it
      figma.currentPage.selection = [instance]
      figma.viewport.scrollAndZoomIntoView([instance])

      emit('PLACEMENT_RESULT', { success: true, componentName: component.name })
    } catch (error: any) {
      emit('PLACEMENT_RESULT', {
        success: false,
        error: error.message || 'Failed to place component'
      })
    }
  })

  // Send selection context to UI whenever selection changes
  figma.on('selectionchange', () => {
    const selection = figma.currentPage.selection
    const context = selection.map((node) => ({
      name: node.name,
      type: node.type,
      width: 'width' in node ? node.width : undefined,
      height: 'height' in node ? node.height : undefined
    }))

    emit('SELECTION_CONTEXT', { selection: context })
  })
}
