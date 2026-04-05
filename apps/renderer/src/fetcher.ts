export default function fetcher<T>(channel: string): Promise<T> {
  switch (channel) {
    case 'provider:getAll':
      return window.provider.getAll() as Promise<T>;
    case 'case:getAll':
      return window.case.getAll() as Promise<T>;
    case 'classification:getSkills':
      return window.classification.getSkills() as Promise<T>;
    case 'logs':
      return window.log.getAll() as Promise<T>;
    case 'dashboard':
      return window.dashboard.getStats() as Promise<T>;
    case 'preset:getAll':
      return window.preset.getAll() as Promise<T>;
    default: {
      const matches = channel.match(/^([a-z]+)\s*:\s*([0-9a-zA-Z-]+)$/);
      if (matches && matches.length === 3) {
        const [_, resource, id] = matches;
        switch (resource) {
          case 'case':
            return window.case.get(id) as Promise<T>;
          case 'casedata':
            return window.case.getWithRelatedData(id) as Promise<T>;
          case 'persons':
            return window.structure.getAllPersons(id) as Promise<T>;
          case 'organizations':
            return window.structure.getAllOrganizations(id) as Promise<T>;
          case 'locations':
            return window.structure.getAllLocations(id) as Promise<T>;
          case 'assets':
            return window.structure.getAllAssets(id) as Promise<T>;
          case 'damages':
            return window.structure.getAllDamages(id) as Promise<T>;
          case 'evidence':
            return window.structure.getAllEvidence(id) as Promise<T>;
          case 'events':
            return window.structure.getAllEvents(id) as Promise<T>;
          case 'links':
            return window.structure.getAllLinks(id) as Promise<T>;
          case 'classification':
            return window.classification.getAll(id) as Promise<T>;
          case 'suggestions':
            return window.advisor.getAllSuggestions(id) as Promise<T>;
          case 'synthesis':
            return window.advisor.getSynthesis(id) as Promise<T>;
        }
      }
      throw new Error(`Unknown channel: ${channel}`);
    }
  }
}
