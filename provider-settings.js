(function() {
  'use strict';

  const registry = globalThis.BrowserKingRegistry;

  if (!registry) {
    return;
  }

  const providerGrid = document.getElementById('provider-grid');
  const providerSearch = document.getElementById('provider-search');
  const providerSummary = document.getElementById('provider-summary');
  const saveButton = document.getElementById('save-providers');
  const resetButton = document.getElementById('reset-providers');
  const syncAllButton = document.getElementById('sync-all-models');

  let state = null;
  let filterText = '';

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }

  function buildVertexBaseUrl(projectId, location) {
    const loc = (location || 'global').trim();
    const proj = (projectId || '').trim();
    if (!proj) {
      return `https://${loc}-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT_ID/locations/${loc}/publishers/anthropic`;
    }
    return `https://${loc}-aiplatform.googleapis.com/v1/projects/${proj}/locations/${loc}/publishers/anthropic`;
  }

  function renderCard(providerId, definition, providerState) {
    const isActive = state.activeProvider === providerId;
    const note = definition.note
      ? `<div class="card-note">${escapeHtml(definition.note)}</div>`
      : '';

    const isVertex = definition.transport === 'vertexAnthropic';

    const vertexFields = isVertex ? `
      <div class="row">
        <div class="field">
          <label>Project ID</label>
          <input data-action="project-id" placeholder="my-gcp-project-id" value="${escapeHtml(providerState.projectId || '')}" />
          <small>Get it: <code>gcloud config get-value project</code> or <code>gcloud projects list</code></small>
        </div>
        <div class="field">
          <label>Location</label>
          <input data-action="vertex-location" placeholder="global" value="${escapeHtml(providerState.location || 'global')}" />
          <small>e.g. <code>global</code>, <code>us-east5</code>, <code>europe-west1</code>. Check: <code>gcloud ai locations list</code></small>
        </div>
      </div>
    ` : '';

    const apiKeyLabel = isVertex ? 'Access Token' : 'API Key';
    const apiKeyHint = isVertex
      ? `<small>Run <code>gcloud auth print-access-token</code> and paste here. Ensure ADC is set up: <code>gcloud auth application-default login</code>. Tokens expire after ~1 hour.</small>`
      : `<small>${definition.requiresApiKey ? 'Only providers with a key appear in the sidepanel picker.' : 'Local or proxy provider.'}</small>`;

    const baseUrlValue = isVertex
      ? escapeHtml(buildVertexBaseUrl(providerState.projectId, providerState.location))
      : escapeHtml(providerState.baseUrl);

    const baseUrlHint = isVertex
      ? `<small>Auto-constructed from Project ID and Location above. Edit manually to override.</small>`
      : '';

    return `
      <article class="provider-card ${isActive ? 'active' : ''}" data-provider-id="${providerId}" style="--provider-color: ${definition.color}">
        <div class="provider-top">
          <div class="provider-title">
            <span class="provider-dot"></span>
            <div class="provider-heading">
              <h2>${escapeHtml(definition.label)}</h2>
              <p>${definition.transport === 'anthropic' || definition.transport === 'vertexAnthropic' ? 'Native Anthropic messages' : 'OpenAI-compatible chat completions'}</p>
            </div>
          </div>
          <div class="provider-actions">
            <label class="toggle">
              <input type="checkbox" data-action="toggle-enabled" ${providerState.enabled ? 'checked' : ''} />
              Enabled
            </label>
          </div>
        </div>

        ${note}

        ${vertexFields}

        <div class="field">
          <label>Base URL</label>
          <input data-action="base-url" value="${baseUrlValue}" ${isVertex ? 'data-vertex-url="true"' : ''} />
          ${baseUrlHint}
        </div>

        <div class="field">
          <label>${escapeHtml(apiKeyLabel)}</label>
          <input data-action="api-key" type="password" placeholder="${definition.requiresApiKey ? `Enter ${apiKeyLabel.toLowerCase()}` : 'Not required for this provider'}" value="${escapeHtml(providerState.apiKey || '')}" />
          ${apiKeyHint}
        </div>

        <div class="row">
          <div class="field">
            <label>Default model</label>
            <select data-action="model-select">
              ${providerState.models.map((model) => `
                <option value="${escapeHtml(model.id)}" ${model.id === providerState.model ? 'selected' : ''}>
                  ${escapeHtml(model.name)}${model.supportsVision ? ' - vision' : ''}
                </option>
              `).join('')}
            </select>
          </div>
          <div class="field">
            <label>Availability</label>
            <small>
              ${providerState.models.length} models cached${providerState.lastSyncedAt ? `, last synced ${new Date(providerState.lastSyncedAt).toLocaleString()}` : ''}.
            </small>
          </div>
        </div>

        <div class="buttons">
          <button class="primary" data-action="set-active" type="button">${isActive ? 'Active provider' : 'Set active'}</button>
          <button class="secondary" data-action="sync-models" type="button">Fetch models</button>
        </div>

        <div class="status" data-role="status"></div>
      </article>
    `;
  }

  function updateSummary() {
    const enabled = registry.getEnabledProviders(state);
    const currentProvider = registry.getActiveProviderDefinition(state);
    const currentModel = registry.getCurrentModel(state);
    providerSummary.textContent = `${enabled.length} configured provider${enabled.length === 1 ? '' : 's'} available. Active: ${currentProvider.label} / ${currentModel.name}.`;
  }

  function render() {
    const cards = Object.keys(registry.PROVIDERS)
      .filter((providerId) => {
        if (!filterText) {
          return true;
        }

        const definition = registry.getProviderDefinition(providerId);
        const haystack = `${definition.label} ${providerId}`.toLowerCase();
        return haystack.includes(filterText);
      })
      .map((providerId) => renderCard(providerId, registry.getProviderDefinition(providerId), state.providers[providerId]))
      .join('');

    providerGrid.innerHTML = cards;
    updateSummary();
  }

  async function load() {
    state = await registry.loadState();
    render();
  }

  async function persist(message) {
    state = await registry.saveState(state);
    render();
    if (!message) {
      return;
    }
    providerSummary.textContent = message;
  }

  function setCardStatus(card, message, kind) {
    const status = card.querySelector('[data-role="status"]');
    if (!status) {
      return;
    }

    status.textContent = message;
    status.className = `status ${kind || ''}`.trim();
  }

  function canSyncProvider(providerId, providerState) {
    const definition = registry.getProviderDefinition(providerId);
    if (!providerState.enabled) {
      return false;
    }

    if (definition.publicModelsUrl) {
      return true;
    }

    if (!definition.requiresApiKey) {
      return true;
    }

    return Boolean(providerState.apiKey);
  }

  async function syncProviderModels(providerId, card) {
    const providerState = state.providers[providerId];
    if (!canSyncProvider(providerId, providerState)) {
      if (card) {
        setCardStatus(card, 'Add an API key first to fetch models.', 'error');
      }
      return false;
    }

    if (card) {
      setCardStatus(card, 'Fetching live models...', '');
    }

    const models = await registry.fetchProviderModels(providerId, providerState);
    if (!models.length) {
      if (card) {
        setCardStatus(card, 'No models returned by this provider.', 'error');
      }
      return false;
    }

    providerState.models = models;
    if (!models.some((model) => model.id === providerState.model)) {
      providerState.model = models[0].id;
    }
    providerState.lastSyncedAt = Date.now();

    if (card) {
      setCardStatus(card, 'Model list refreshed.', 'success');
    }

    return true;
  }

  providerGrid.addEventListener('input', (event) => {
    const card = event.target.closest('[data-provider-id]');
    if (!card) {
      return;
    }

    const providerId = card.getAttribute('data-provider-id');
    const providerState = state.providers[providerId];
    const action = event.target.getAttribute('data-action');

    if (action === 'base-url') {
      providerState.baseUrl = event.target.value.trim();
    }

    if (action === 'api-key') {
      providerState.apiKey = event.target.value.trim();
    }

    if (action === 'project-id') {
      providerState.projectId = event.target.value.trim();
      const urlInput = card.querySelector('input[data-vertex-url="true"]');
      if (urlInput) {
        const newUrl = buildVertexBaseUrl(providerState.projectId, providerState.location);
        urlInput.value = newUrl;
        providerState.baseUrl = newUrl;
      }
    }

    if (action === 'vertex-location') {
      providerState.location = event.target.value.trim() || 'global';
      const urlInput = card.querySelector('input[data-vertex-url="true"]');
      if (urlInput) {
        const newUrl = buildVertexBaseUrl(providerState.projectId, providerState.location);
        urlInput.value = newUrl;
        providerState.baseUrl = newUrl;
      }
    }
  });

  providerGrid.addEventListener('change', (event) => {
    const card = event.target.closest('[data-provider-id]');
    if (!card) {
      return;
    }

    const providerId = card.getAttribute('data-provider-id');
    const providerState = state.providers[providerId];
    const action = event.target.getAttribute('data-action');

    if (action === 'toggle-enabled') {
      providerState.enabled = event.target.checked;
    }

    if (action === 'model-select') {
      providerState.model = event.target.value;
    }
  });

  providerGrid.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) {
      return;
    }

    const card = event.target.closest('[data-provider-id]');
    if (!card) {
      return;
    }

    const providerId = card.getAttribute('data-provider-id');
    const providerState = state.providers[providerId];
    const action = button.getAttribute('data-action');

    if (action === 'set-active') {
      state.activeProvider = providerId;
      providerState.enabled = true;
      await persist(`Active provider updated to ${registry.getProviderDefinition(providerId).label}.`);
      return;
    }

    if (action === 'sync-models') {
      try {
        const synced = await syncProviderModels(providerId, card);
        if (synced) {
          await persist(`Fetched live models for ${registry.getProviderDefinition(providerId).label}.`);
        }
      } catch (error) {
        setCardStatus(card, error.message || 'Failed to fetch models.', 'error');
      }
    }
  });

  providerSearch.addEventListener('input', () => {
    filterText = providerSearch.value.trim().toLowerCase();
    render();
  });

  saveButton.addEventListener('click', async () => {
    providerSummary.textContent = 'Saving provider configuration and refreshing live model catalogs...';
    for (const providerId of Object.keys(state.providers)) {
      try {
        await syncProviderModels(providerId);
      } catch (error) {
        console.warn('[Provider Settings] Failed to sync models for', providerId, error);
      }
    }
    await persist('Provider configuration saved and live model catalogs refreshed.');
  });

  resetButton.addEventListener('click', async () => {
    state = registry.buildDefaultState();
    await persist('Provider configuration reset to defaults.');
  });

  syncAllButton.addEventListener('click', async () => {
    providerSummary.textContent = 'Fetching models from enabled providers...';

    const providerIds = Object.keys(state.providers).filter((providerId) => canSyncProvider(providerId, state.providers[providerId]));
    for (const providerId of providerIds) {
      try {
        await syncProviderModels(providerId);
      } catch (error) {
        console.warn('[Provider Settings] Failed to sync models for', providerId, error);
      }
    }

    await persist('Live model sync finished.');
  });

  load();
})();
