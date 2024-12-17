// Check for invalid factory data e.g. inputs without factories etc
import { findFac } from '@/utils/factory-management/factory'
import { Factory } from '@/interfaces/planner/FactoryInterface'

export const validateFactories = (factories: Factory[]) => {
  let hasErrors = false

  factories.forEach(factory => {
    console.log('Validating factory:', factory.name)

    factory.inputs.forEach(input => {
      try {
        findFac(Number(input.factoryId), factories)
      } catch (err) {
        hasErrors = true
        console.error(`Factory "${factory.name}" (${factory.id}) has an input for ${input.factoryId} with part ${input.outputPart} where which the factory does not exist!`)

        // Remove the input
        const index = factory.inputs.findIndex(i => i.factoryId === input.factoryId)
        if (index !== -1) {
          factory.inputs.splice(index, 1)
        }
      }
    })

    // Check the dependencies to ensure the factories they're requesting exist
    Object.keys(factory.dependencies.requests).forEach(depFacId => {
      try {
        findFac(depFacId, factories)
      } catch (error) {
        hasErrors = true
        console.error(`Factory "${factory.name}" (${factory.id}) has a dependency for ${depFacId} which does not exist!`)

        // Remove the dependency
        delete factory.dependencies.requests[depFacId]
      }
    })
  })

  if (hasErrors) {
    alert('There were errors loading your factory data. Please check the browser console for more details.')
  }
}
