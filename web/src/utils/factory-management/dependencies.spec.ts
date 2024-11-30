import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Factory } from '@/interfaces/planner/FactoryInterface'
import { calculateFactories, newFactory } from '@/utils/factory-management/factory'
import {
  addDependency,
  calculateDependencyMetrics,
  constructDependencies,
  removeFactoryDependants,
} from '@/utils/factory-management/dependencies'
import { addInputToFactory } from '@/utils/factory-management/inputs'
import { gameData } from '@/utils/gameData'
import { addProductToFactory } from '@/utils/factory-management/products'

describe('dependencies', () => {
  let factories: Factory[] = []
  let mockFactory: Factory
  let mockDependantFactory: Factory

  beforeEach(() => {
    mockFactory = newFactory('Iron Ingots')
    mockDependantFactory = newFactory('Iron Plates')
    factories = [mockFactory, mockDependantFactory]
  })

  describe('addDependency', () => {
    it('should add a dependency between two factories', () => {
      const input = {
        factoryId: mockFactory.id,
        outputPart: 'IronIngot',
        amount: 900,
      }

      expect(() => {
        addDependency(mockFactory, mockDependantFactory, input)
      }).not.toThrow()

      expect(mockDependantFactory.dependencies.requests[mockFactory.id].length).toBe(1)

      expect(mockDependantFactory.dependencies.requests[mockFactory.id][0].part).toBe('IronIngot')
    })

    it('should throw an error if output part is not supplied', () => {
      const input = {
        factoryId: mockFactory.id,
        outputPart: '',
        amount: 900,
      }

      expect(() => {
        addDependency(mockFactory, mockDependantFactory, input)
      }).toThrow()
    })

    it('should deny adding a dependency if one already exists', () => {
      const input = {
        factoryId: mockFactory.id,
        outputPart: 'IronIngot',
        amount: 900,
      }
      const input2 = {
        factoryId: mockFactory.id,
        outputPart: 'IronIngot',
        amount: 900,
      }

      expect(() => {
        addDependency(mockFactory, mockDependantFactory, input)
        addDependency(mockFactory, mockDependantFactory, input2)
      }).toThrow()
    })
  })

  describe('constructDependencies', () => {
    it('should construct dependencies between factories', () => {
      const input = {
        factoryId: mockFactory.id,
        outputPart: 'IronIngot',
        amount: 900,
      }

      addInputToFactory(mockDependantFactory, input)
      constructDependencies(factories)
      expect(mockFactory.dependencies.requests[mockDependantFactory.id].length).toBe(1)
      expect(mockFactory.dependencies.requests[mockDependantFactory.id][0].part).toBe('IronIngot')
    })

    it('should prevent adding dependencies from invalid input data', () => {
      factories.find = vi.fn()
      const input = {
        factoryId: 0,
        outputPart: '',
        amount: 123,
      }
      mockDependantFactory.inputs.push(input)

      constructDependencies(factories)
      // TODO: console.error should be called
      expect(factories.find).toBeCalledTimes(0)
    })

    it('should prevent adding dependencies to itself', () => {
      const input = {
        factoryId: mockFactory.id,
        outputPart: 'IronIngot',
        amount: 900,
      }

      addInputToFactory(mockFactory, input)
      expect(() => {
        constructDependencies(factories)
      }).toThrow()
    })

    it('should prevent adding dependencies when provider factory does not exist', () => {
      const input = {
        factoryId: 1234,
        outputPart: 'IronIngot',
        amount: 900,
      }

      mockDependantFactory.inputs.push(input)
      // It should have force added the input.
      expect(mockDependantFactory.inputs.length).toBe(1)

      constructDependencies(factories)
      // TODO: console.error should be called

      // The invalid input should be removed.
      expect(mockDependantFactory.inputs.length).toBe(0)
      // Ensure no factories have any dependencies
      expect(mockFactory.dependencies.requests).toEqual({})
      expect(mockDependantFactory.dependencies.requests).toEqual({})
    })
  })

  describe('calculateDependencyMetrics', () => {
    it('should calculate the dependency metrics for multiple inputs from a singular factory', () => {
      const input = {
        factoryId: mockFactory.id,
        outputPart: 'IronIngot',
        amount: 900,
      }
      const input2 = {
        factoryId: mockFactory.id,
        outputPart: 'CopperIngot',
        amount: 123,
      }

      addInputToFactory(mockDependantFactory, input)
      addInputToFactory(mockDependantFactory, input2)
      constructDependencies(factories)
      mockFactory.parts.IronIngot = {
        amountRemaining: 1000,
      } as any
      mockFactory.parts.CopperIngot = {
        amountRemaining: 23,
      } as any

      calculateDependencyMetrics(mockFactory)

      expect(mockFactory.dependencies.metrics.IronIngot).toStrictEqual({
        part: 'IronIngot',
        request: 900,
        supply: 1000,
        isRequestSatisfied: true,
        difference: 100,
      })
      expect(mockFactory.dependencies.metrics.CopperIngot).toStrictEqual({
        part: 'CopperIngot',
        request: 123,
        supply: 23,
        isRequestSatisfied: false,
        difference: -100,
      })
    })
    it('should calculate the dependency metrics from multiple inputs from differing factories', () => {
      const mockDependantFactory2 = newFactory('Iron Rods')
      // Ensure the new factory is in the list
      factories = [mockFactory, mockDependantFactory, mockDependantFactory2]

      const input = {
        factoryId: mockFactory.id,
        outputPart: 'IronIngot',
        amount: 100, // This should equal 200 eventually as we have it twice across two factories
      }

      addInputToFactory(mockDependantFactory, input)
      addInputToFactory(mockDependantFactory2, input)

      constructDependencies(factories)
      mockFactory.parts.IronIngot = {
        amountRemaining: 150,
      } as any // Naughty yes but typescript is being a pain

      calculateDependencyMetrics(mockFactory)

      expect(mockFactory.dependencies.metrics.IronIngot).toStrictEqual({
        part: 'IronIngot',
        request: 200,
        supply: 150,
        isRequestSatisfied: false,
        difference: -50,
      })
    })
  })

  describe('removeFactoryDependants', () => {
    it('should remove dependants of the factory', () => {
      const input = {
        factoryId: mockFactory.id,
        outputPart: 'IronIngot',
        amount: 900,
      }
      const input2 = {
        factoryId: mockFactory.id,
        outputPart: 'CopperIngot',
        amount: 900,
      }

      addInputToFactory(mockDependantFactory, input)
      addInputToFactory(mockDependantFactory, input2)
      constructDependencies(factories)
      removeFactoryDependants(mockFactory, factories)

      // Assume the tests work and the dependency is added
      // Now check if the dependant is removed
      expect(mockFactory.dependencies.requests[mockFactory.id]).toBe(undefined)

      // And also check if the input has been filtered from the dependant
      expect(mockDependantFactory.inputs.length).toBe(0)
    })
  })

  describe('scanForInvalidImports', () => {
    it('should remove invalid import requests', () => {
      const factory1 = newFactory('Factory 1')
      const factory2 = newFactory('Factory 2')

      // Legit product that we are requesting.
      addProductToFactory(factory1, {
        id: 'CopperIngot',
        amount: 100,
        recipe: 'IngotCopper',
      })

      // Invalid input
      addInputToFactory(factory2, {
        factoryId: factory1.id,
        outputPart: 'IronIngot',
        amount: 100,
      })
      // Valid input
      addInputToFactory(factory2, {
        factoryId: factory1.id,
        outputPart: 'CopperIngot',
        amount: 100,
      })

      calculateFactories([factory1, factory2], gameData)

      expect(factory1.exports.IronIngot).not.toBeDefined()
      expect(factory1.exports.CopperIngot).toBeDefined()
      expect(factory1.products.length).toBe(1)
      expect(factory2.inputs.length).toBe(1) // NOT 2
      expect(factory2.inputs[0].outputPart).toBe('CopperIngot')

      const foundInvalidInput = factory2.inputs.find(input => input.outputPart === 'IronIngot')
      expect(foundInvalidInput).not.toBeDefined()
    })
  })
})
