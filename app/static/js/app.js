/* ===============================================================
   Env-Guard | Frontend Logic - Professional Redesign
   =============================================================== */

(function () {
  "use strict";

  /* ---------------------------------------------------------------
     Theme Toggle
  --------------------------------------------------------------- */
  const themeToggle = document.getElementById("themeToggle");

  function getCurrentTheme() {
    return document.documentElement.getAttribute("data-theme") || "light";
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      setTheme(getCurrentTheme() === "dark" ? "light" : "dark");
    });
  }

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      setTheme(e.matches ? "dark" : "light");
    }
  });

  /* ---------------------------------------------------------------
     Global State
  --------------------------------------------------------------- */
  let schemasData = [];
  let selectedSchema = "generic";

  /* ---------------------------------------------------------------
     DOM Elements
  --------------------------------------------------------------- */
  const schemaSelector = document.getElementById("schemaSelector");
  const schemaPreview = document.getElementById("schemaPreview");
  const customSchemaBlock = document.getElementById("customSchemaBlock");
  const validateForm = document.getElementById("validate-form");
  const compareForm = document.getElementById("compare-form");
  const resultPanel = document.getElementById("resultPanel");
  const resultFormatted = document.getElementById("resultFormatted");
  const resultJson = document.getElementById("resultJson");
  const submitBtn = document.getElementById("submitBtn");
  const schemasGrid = document.getElementById("schemasGrid");

  /* ---------------------------------------------------------------
     Load Schemas
  --------------------------------------------------------------- */
  async function loadSchemas() {
    try {
      const res = await fetch("/api/schemas");
      schemasData = await res.json();
      
      if (schemasGrid) {
        renderSchemasGrid(schemasData);
      }
      
      if (schemaSelector) {
        renderSchemaSelector(schemasData);
        // Load first schema preview
        if (schemasData.length > 0) {
          loadSchemaPreview(schemasData[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load schemas:", err);
      if (schemasGrid) {
        schemasGrid.innerHTML = `<div class="template-loading">Failed to load schemas</div>`;
      }
    }
  }

  /* ---------------------------------------------------------------
     Render Schemas Grid (Home Page)
  --------------------------------------------------------------- */
  function renderSchemasGrid(schemas) {
    if (!schemasGrid) return;
    
    schemasGrid.innerHTML = schemas.map(schema => `
      <div class="template-card">
        <div class="template-header">
          <div class="template-icon" style="background: ${schema.color}15; color: ${schema.color}">
            <i class="bi ${schema.icon}"></i>
          </div>
          <span class="template-name">${schema.name}</span>
        </div>
        <p class="template-desc">${schema.description}</p>
        <div class="template-stats">
          <span class="template-stat">
            <i class="bi bi-braces"></i>
            ${schema.variables} vars
          </span>
          <span class="template-stat required">
            <i class="bi bi-asterisk"></i>
            ${schema.required} required
          </span>
        </div>
      </div>
    `).join("");
  }

  /* ---------------------------------------------------------------
     Render Schema Selector (Validate/Compare Pages)
  --------------------------------------------------------------- */
  function renderSchemaSelector(schemas) {
    if (!schemaSelector) return;

    const customOption = {
      id: "custom",
      name: "Custom",
      icon: "bi-gear",
      color: "#64748b",
      variables: "?",
    };

    const allSchemas = [...schemas, customOption];

    schemaSelector.innerHTML = allSchemas.map(schema => `
      <div class="schema-option">
        <input 
          type="radio" 
          name="schema" 
          id="schema-${schema.id}" 
          value="${schema.id}"
          ${schema.id === "generic" ? "checked" : ""}
        />
        <label for="schema-${schema.id}">
          <div class="schema-option-icon" style="color: ${schema.color}">
            <i class="bi ${schema.icon}"></i>
          </div>
          <span class="schema-option-name">${schema.name}</span>
          <span class="schema-option-count">${schema.variables} vars</span>
        </label>
      </div>
    `).join("");

    // Add change listeners
    schemaSelector.querySelectorAll('input[name="schema"]').forEach(input => {
      input.addEventListener("change", (e) => {
        selectedSchema = e.target.value;
        
        if (customSchemaBlock) {
          customSchemaBlock.classList.toggle("d-none", selectedSchema !== "custom");
        }
        
        if (selectedSchema !== "custom") {
          loadSchemaPreview(selectedSchema);
        } else {
          renderSchemaPreviewPlaceholder("Upload a custom YAML schema");
        }
      });
    });
  }

  /* ---------------------------------------------------------------
     Load Schema Preview
  --------------------------------------------------------------- */
  async function loadSchemaPreview(schemaId) {
    if (!schemaPreview) return;

    const previewBody = schemaPreview.querySelector(".preview-body");
    previewBody.innerHTML = `
      <div class="preview-placeholder">
        <div class="spinner-border spinner-border-sm" role="status"></div>
        <span>Loading...</span>
      </div>
    `;

    try {
      const res = await fetch(`/api/schemas/${schemaId}`);
      const schema = await res.json();
      renderSchemaPreview(schema, schemaId);
    } catch (err) {
      previewBody.innerHTML = `
        <div class="preview-placeholder">
          <i class="bi bi-exclamation-triangle"></i>
          <span>Failed to load schema</span>
        </div>
      `;
    }
  }

  /* ---------------------------------------------------------------
     Render Schema Preview
  --------------------------------------------------------------- */
  function renderSchemaPreview(schema, schemaId) {
    if (!schemaPreview) return;

    const meta = schemasData.find(s => s.id === schemaId) || {};
    const previewBody = schemaPreview.querySelector(".preview-body");
    const variables = schema.variables || {};
    const varEntries = Object.entries(variables);

    let html = `
      <div class="preview-meta">
        <div class="preview-meta-name">${meta.name || schemaId}</div>
        <div class="preview-meta-desc">${meta.description || ""}</div>
      </div>
      <div class="preview-vars-title">Variables (${varEntries.length})</div>
    `;

    varEntries.forEach(([key, config]) => {
      const isRequired = config.required === true;
      const type = config.type || "string";

      html += `
        <div class="preview-var">
          <div class="preview-var-indicator ${isRequired ? "required" : "optional"}"></div>
          <div class="preview-var-content">
            <div class="preview-var-name">${escapeHtml(key)}</div>
            <div class="preview-var-meta">
              <span class="preview-var-type">${type}</span>
              ${isRequired ? '<span class="preview-var-required">required</span>' : ""}
            </div>
          </div>
        </div>
      `;
    });

    previewBody.innerHTML = html;
  }

  function renderSchemaPreviewPlaceholder(message) {
    if (!schemaPreview) return;
    const previewBody = schemaPreview.querySelector(".preview-body");
    previewBody.innerHTML = `
      <div class="preview-placeholder">
        <i class="bi bi-diagram-3"></i>
        <span>${message}</span>
      </div>
    `;
  }

  /* ---------------------------------------------------------------
     File Drop Zones
  --------------------------------------------------------------- */
  function initFileDropZones() {
    document.querySelectorAll(".file-drop-zone").forEach(zone => {
      const input = zone.querySelector(".file-input");
      const dropContent = zone.querySelector(".drop-content");
      const fileSelected = zone.querySelector(".file-selected");
      const fileName = zone.querySelector(".file-name");
      const removeBtn = zone.querySelector(".file-remove");

      if (!input) return;

      // Drag events
      ["dragenter", "dragover"].forEach(evt => {
        zone.addEventListener(evt, (e) => {
          e.preventDefault();
          zone.classList.add("dragover");
        });
      });

      ["dragleave", "drop"].forEach(evt => {
        zone.addEventListener(evt, (e) => {
          e.preventDefault();
          zone.classList.remove("dragover");
        });
      });

      zone.addEventListener("drop", (e) => {
        const files = e.dataTransfer.files;
        if (files.length) {
          input.files = files;
          updateFileDisplay(files[0]);
        }
      });

      // Input change
      input.addEventListener("change", () => {
        if (input.files.length) {
          updateFileDisplay(input.files[0]);
        }
      });

      // Remove button
      if (removeBtn) {
        removeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          input.value = "";
          dropContent.classList.remove("d-none");
          fileSelected.classList.add("d-none");
        });
      }

            function updateFileDisplay(file) {
        if (fileName) fileName.textContent = file.name;
        if (dropContent) dropContent.classList.add("d-none");
        if (fileSelected) fileSelected.classList.remove("d-none");
      }
    });
  }

  /* ---------------------------------------------------------------
     View Toggle
  --------------------------------------------------------------- */
  const viewToggleGroup = document.querySelector(".view-toggle-group");

  if (viewToggleGroup) {
    viewToggleGroup.addEventListener("click", (e) => {
      const btn = e.target.closest(".view-toggle-btn");
      if (!btn) return;

      viewToggleGroup.querySelectorAll(".view-toggle-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const view = btn.dataset.view;
      if (resultFormatted) resultFormatted.classList.toggle("d-none", view === "json");
      if (resultJson) resultJson.classList.toggle("d-none", view === "formatted");
    });
  }

  /* ---------------------------------------------------------------
     Loading State
  --------------------------------------------------------------- */
  function setLoading(loading) {
    if (!submitBtn) return;
    submitBtn.classList.toggle("btn-loading", loading);
    submitBtn.disabled = loading;
  }

  /* ---------------------------------------------------------------
     Show Result
  --------------------------------------------------------------- */
  function showResult(data, mode) {
    if (resultJson) {
      resultJson.textContent = JSON.stringify(data, null, 2);
    }

    if (resultFormatted) {
      resultFormatted.innerHTML = mode === "validate" 
        ? renderValidateResult(data) 
        : renderCompareResult(data);
    }

    // Reset view toggle
    if (viewToggleGroup) {
      viewToggleGroup.querySelectorAll(".view-toggle-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.view === "formatted");
      });
    }

    if (resultFormatted) resultFormatted.classList.remove("d-none");
    if (resultJson) resultJson.classList.add("d-none");
    if (resultPanel) resultPanel.classList.remove("d-none");

    // Scroll to results
    resultPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------------------------------------------------------------
     Render Validate Result
  --------------------------------------------------------------- */
  function renderValidateResult(data) {
    const { missing, invalid, extra, validated } = data;
    const validatedKeys = Object.keys(validated);

    let html = renderSummary({
      validated: validatedKeys.length,
      missing: missing.length,
      invalid: invalid.length,
      extra: extra.length,
    });

    if (validatedKeys.length) {
      html += renderSection("success", "bi-check-circle", `Validated (${validatedKeys.length})`, renderKeyValueTable(validated));
    }

    if (missing.length) {
      html += renderSection("danger", "bi-x-circle", `Missing (${missing.length})`, renderSimpleList(missing));
    }

    if (invalid.length) {
      html += renderSection("warning", "bi-exclamation-triangle", `Invalid (${invalid.length})`, renderInvalidTable(invalid));
    }

    if (extra.length) {
      html += renderSection("info", "bi-info-circle", `Extra (${extra.length})`, renderSimpleList(extra));
    }

    return html;
  }

  /* ---------------------------------------------------------------
     Render Compare Result
  --------------------------------------------------------------- */
  function renderCompareResult(data) {
    const { only_in_a, only_in_b, different_values, validation } = data;

    let html = `
      <div class="summary-stats">
        <div class="stat-item info">
          <i class="bi bi-dash-circle"></i>
          <span><strong>${only_in_a.length}</strong> only in A</span>
        </div>
        <div class="stat-item warning">
          <i class="bi bi-plus-circle"></i>
          <span><strong>${only_in_b.length}</strong> only in B</span>
        </div>
        <div class="stat-item danger">
          <i class="bi bi-arrow-left-right"></i>
          <span><strong>${different_values.length}</strong> different</span>
        </div>
      </div>
    `;

    if (only_in_a.length || only_in_b.length || different_values.length) {
      html += renderSection("neutral", "bi-diagram-3", "Differences", renderDifferencesTable(data));
    }

    html += '<div class="compare-grid">';
    html += `
      <div class="env-panel">
        <div class="env-panel-header env-a">Env A Validation</div>
        ${renderEnvValidationCompact(validation.a)}
      </div>
    `;
    html += `
      <div class="env-panel">
        <div class="env-panel-header env-b">Env B Validation</div>
        ${renderEnvValidationCompact(validation.b)}
      </div>
    `;
    html += "</div>";

    return html;
  }

  /* ---------------------------------------------------------------
     Render Differences Table
  --------------------------------------------------------------- */
  function renderDifferencesTable(data) {
    const { only_in_a, only_in_b, different_values, validation } = data;
    let rows = "";

    only_in_a.forEach(key => {
      const valA = validation.a.validated[key];
      rows += `
        <tr>
          <td class="key-cell">${escapeHtml(key)}</td>
          <td><span class="diff-badge only-a"><i class="bi bi-dash"></i> Only A</span></td>
          <td class="value-cell">${escapeHtml(formatValue(valA))}</td>
          <td class="text-muted">—</td>
        </tr>
      `;
    });

    only_in_b.forEach(key => {
      const valB = validation.b.validated[key];
      rows += `
        <tr>
          <td class="key-cell">${escapeHtml(key)}</td>
          <td><span class="diff-badge only-b"><i class="bi bi-plus"></i> Only B</span></td>
          <td class="text-muted">—</td>
          <td class="value-cell">${escapeHtml(formatValue(valB))}</td>
        </tr>
      `;
    });

    different_values.forEach(key => {
      const valA = validation.a.validated[key];
      const valB = validation.b.validated[key];
      rows += `
        <tr>
          <td class="key-cell">${escapeHtml(key)}</td>
          <td><span class="diff-badge different"><i class="bi bi-arrow-left-right"></i> Diff</span></td>
          <td class="value-cell">${escapeHtml(formatValue(valA))}</td>
          <td class="value-cell">${escapeHtml(formatValue(valB))}</td>
        </tr>
      `;
    });

    if (!rows) {
      return '<div class="section-body empty">No differences found — files are identical</div>';
    }

    return `
      <table class="data-table">
        <thead>
          <tr><th>Variable</th><th>Status</th><th>Value A</th><th>Value B</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  /* ---------------------------------------------------------------
     Render Env Validation Compact
  --------------------------------------------------------------- */
  function renderEnvValidationCompact(validation) {
    const { missing, invalid, extra, validated } = validation;
    const validatedCount = Object.keys(validated).length;

    let html = '<div class="env-validation-content">';
    html += '<div class="env-mini-stats">';
    html += `<span class="diff-badge" style="background: rgba(16,185,129,0.1); color: var(--brand-success);"><i class="bi bi-check"></i> ${validatedCount} valid</span>`;
    if (missing.length) html += `<span class="diff-badge" style="background: rgba(239,68,68,0.1); color: var(--brand-danger);"><i class="bi bi-x"></i> ${missing.length} missing</span>`;
    if (invalid.length) html += `<span class="diff-badge" style="background: rgba(245,158,11,0.1); color: var(--brand-warning);"><i class="bi bi-exclamation"></i> ${invalid.length} invalid</span>`;
    if (extra.length) html += `<span class="diff-badge" style="background: rgba(6,182,212,0.1); color: var(--brand-info);"><i class="bi bi-plus"></i> ${extra.length} extra</span>`;
    html += "</div>";

    if (missing.length) {
      html += `<div class="env-issues"><small class="env-issues-label">Missing:</small><div class="env-issues-list missing">${missing.map(escapeHtml).join(", ")}</div></div>`;
    }

    if (invalid.length) {
      html += '<div class="env-issues"><small class="env-issues-label">Invalid:</small>';
      invalid.forEach(item => {
        html += `<div class="env-issues-list invalid"><span class="invalid-key">${escapeHtml(item.key)}</span>: ${escapeHtml(item.reason)}</div>`;
      });
      html += "</div>";
    }

    if (!missing.length && !invalid.length && validatedCount > 0) {
      html += '<div class="env-all-valid"><i class="bi bi-check-circle me-1"></i>All variables valid</div>';
    }

    html += "</div>";
    return html;
  }

  /* ---------------------------------------------------------------
     Helper Renderers
  --------------------------------------------------------------- */
  function renderSummary(counts) {
    return `
      <div class="summary-stats">
        <div class="stat-item success">
          <i class="bi bi-check-circle"></i>
          <span><strong>${counts.validated}</strong> validated</span>
        </div>
        <div class="stat-item danger">
          <i class="bi bi-x-circle"></i>
          <span><strong>${counts.missing}</strong> missing</span>
        </div>
        <div class="stat-item warning">
          <i class="bi bi-exclamation-triangle"></i>
          <span><strong>${counts.invalid}</strong> invalid</span>
        </div>
        <div class="stat-item info">
          <i class="bi bi-info-circle"></i>
          <span><strong>${counts.extra}</strong> extra</span>
        </div>
      </div>
    `;
  }

  function renderSection(type, icon, title, body) {
    const isBodyHtml = typeof body === "string" && (body.startsWith("<div") || body.startsWith("<table"));
    return `
      <div class="result-section">
        <div class="section-header ${type}">
          <i class="bi ${icon}"></i>
          ${title}
        </div>
        ${isBodyHtml ? body : '<div class="section-body">' + body + "</div>"}
      </div>
    `;
  }

  function renderKeyValueTable(obj) {
    let rows = "";
    for (const [key, value] of Object.entries(obj)) {
      rows += `
        <tr>
          <td class="key-cell">${escapeHtml(key)}</td>
          <td class="value-cell">${escapeHtml(formatValue(value))}</td>
        </tr>
      `;
    }
    return `
      <table class="data-table">
        <thead><tr><th>Variable</th><th>Value</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function renderInvalidTable(items) {
    let rows = "";
    items.forEach(item => {
      rows += `
        <tr>
          <td class="key-cell">${escapeHtml(item.key)}</td>
          <td class="reason-cell">${escapeHtml(item.reason)}</td>
        </tr>
      `;
    });
    return `
      <table class="data-table">
        <thead><tr><th>Variable</th><th>Reason</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function renderSimpleList(items) {
    return `<ul class="simple-list">${items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  function formatValue(val) {
    if (val === true) return "true";
    if (val === false) return "false";
    if (val === null || val === undefined) return "null";
    return String(val);
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---------------------------------------------------------------
     Validate Form Submit
  --------------------------------------------------------------- */
  if (validateForm) {
    validateForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const envFile = document.getElementById("envFile")?.files[0];
      const schema = document.querySelector('input[name="schema"]:checked')?.value || "generic";
      const schemaFileInput = document.getElementById("schemaFile");

      if (!envFile) {
        alert("Please select a .env file.");
        return;
      }

      const formData = new FormData();
      formData.append("file", envFile);

      let url = "/api/validate";

      if (schema === "custom") {
        const schemaFile = schemaFileInput?.files[0];
        if (!schemaFile) {
          alert("Please upload a custom schema file.");
          return;
        }
        formData.append("schema_file", schemaFile);
      } else {
        url += `?schema=${schema}`;
      }

      setLoading(true);

      try {
        const res = await fetch(url, { method: "POST", body: formData });
        const data = await res.json();
        showResult(data, "validate");
      } catch (err) {
        alert("Error: " + err.message);
      } finally {
        setLoading(false);
      }
    });
  }

  /* ---------------------------------------------------------------
     Compare Form Submit
  --------------------------------------------------------------- */
  if (compareForm) {
    compareForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const envA = document.getElementById("envA")?.files[0];
      const envB = document.getElementById("envB")?.files[0];
      const schema = document.querySelector('input[name="schema"]:checked')?.value || "generic";
      const schemaFileInput = document.getElementById("schemaFile");

      if (!envA || !envB) {
        alert("Please select both env files.");
        return;
      }

      const formData = new FormData();
      formData.append("env_a", envA);
      formData.append("env_b", envB);

      let url = "/api/compare";

      if (schema === "custom") {
        const schemaFile = schemaFileInput?.files[0];
        if (!schemaFile) {
          alert("Please upload a custom schema file.");
          return;
        }
        formData.append("schema_file", schemaFile);
      } else {
        url += `?schema=${schema}`;
      }

      setLoading(true);

      try {
        const res = await fetch(url, { method: "POST", body: formData });
        const data = await res.json();
        showResult(data, "compare");
      } catch (err) {
        alert("Error: " + err.message);
      } finally {
        setLoading(false);
      }
    });
  }

  /* ---------------------------------------------------------------
     Initialize
  --------------------------------------------------------------- */
  function init() {
    loadSchemas();
    initFileDropZones();
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
