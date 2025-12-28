/* ===============================================================
   Env-Guard | Frontend Logic
=============================================================== */

(function () {
  "use strict";

  /* ---------------------------------------------------------------
     DOM Elements
  --------------------------------------------------------------- */
  const schemaSelect = document.getElementById("schemaSelect");
  const customSchemaBlock = document.getElementById("customSchemaBlock");
  const validateForm = document.getElementById("validate-form");
  const compareForm = document.getElementById("compare-form");
  const resultPanel = document.getElementById("resultPanel");
  const resultFormatted = document.getElementById("resultFormatted");
  const resultJson = document.getElementById("resultJson");
  const jsonToggle = document.getElementById("jsonToggle");
  const submitBtn = document.getElementById("submitBtn");

  let currentData = null;
  let currentMode = null; // 'validate' or 'compare'

  /* ---------------------------------------------------------------
     Schema Selector Toggle
  --------------------------------------------------------------- */
  if (schemaSelect && customSchemaBlock) {
    schemaSelect.addEventListener("change", () => {
      customSchemaBlock.classList.toggle(
        "d-none",
        schemaSelect.value !== "custom"
      );
    });
  }

    /* ---------------------------------------------------------------
     View Toggle (Segmented Control)
  --------------------------------------------------------------- */
  const viewToggleGroup = document.querySelector(".view-toggle-group");

  if (viewToggleGroup) {
    viewToggleGroup.addEventListener("click", (e) => {
      const btn = e.target.closest(".view-toggle-btn");
      if (!btn) return;

      // Update active state
      viewToggleGroup.querySelectorAll(".view-toggle-btn").forEach((b) => {
        b.classList.remove("active");
      });
      btn.classList.add("active");

      // Toggle views
      const view = btn.dataset.view;
      resultFormatted.classList.toggle("d-none", view === "json");
      resultJson.classList.toggle("d-none", view === "formatted");
    });
  }


  /* ---------------------------------------------------------------
     Button Loading State
  --------------------------------------------------------------- */
  function setLoading(loading) {
    if (!submitBtn) return;
    if (loading) {
      submitBtn.classList.add("btn-loading");
      submitBtn.disabled = true;
    } else {
      submitBtn.classList.remove("btn-loading");
      submitBtn.disabled = false;
    }
  }

  /* ---------------------------------------------------------------
     Show Result
  --------------------------------------------------------------- */
  function showResult(data, mode) {
    currentData = data;
    currentMode = mode;

    // JSON view
    resultJson.textContent = JSON.stringify(data, null, 2);

    // Formatted view
    if (mode === "validate") {
      resultFormatted.innerHTML = renderValidateResult(data);
    } else {
      resultFormatted.innerHTML = renderCompareResult(data);
    }

    // Reset toggle to formatted (default)
    if (viewToggleGroup) {
      viewToggleGroup.querySelectorAll(".view-toggle-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.view === "formatted");
      });
    }
    resultFormatted.classList.remove("d-none");
    resultJson.classList.add("d-none");

    resultPanel.classList.remove("d-none");
  }

  /* ---------------------------------------------------------------
     Render Validate Result
  --------------------------------------------------------------- */
  function renderValidateResult(data) {
    const { missing, invalid, extra, validated } = data;
    const validatedKeys = Object.keys(validated);

    let html = "";

    // Summary (sempre visível)
    html += renderSummary({
      validated: validatedKeys.length,
      missing: missing.length,
      invalid: invalid.length,
      extra: extra.length,
    });

    // Validated (só se tiver)
    if (validatedKeys.length) {
      html += renderSection(
        "success",
        "bi-check-circle",
        `Validated (${validatedKeys.length})`,
        renderKeyValueTable(validated)
      );
    }

    // Missing (só se tiver)
    if (missing.length) {
      html += renderSection(
        "danger",
        "bi-x-circle",
        `Missing (${missing.length})`,
        renderSimpleList(missing)
      );
    }

    // Invalid (só se tiver)
    if (invalid.length) {
      html += renderSection(
        "warning",
        "bi-exclamation-triangle",
        `Invalid (${invalid.length})`,
        renderInvalidTable(invalid)
      );
    }

    // Extra (só se tiver)
    if (extra.length) {
      html += renderSection(
        "info",
        "bi-info-circle",
        `Extra (${extra.length})`,
        renderSimpleList(extra)
      );
    }

    return html;
  }


  /* ---------------------------------------------------------------
     Render Compare Result
  --------------------------------------------------------------- */
  function renderCompareResult(data) {
    const { only_in_a, only_in_b, different_values, validation } = data;

    let html = "";

    // Diff Summary (sempre visível)
    html += '<div class="summary-stats">';
    html += `
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
        <span><strong>${different_values.length}</strong> different values</span>
      </div>
    `;
    html += "</div>";

    // Differences Section (só se tiver diferenças)
    if (only_in_a.length || only_in_b.length || different_values.length) {
      html += renderSection(
        "neutral",
        "bi-diagram-3",
        "Differences",
        renderDifferencesTable(data)
      );
    }

    // Side by side validation
    html += '<div class="compare-grid">';

    // Env A
    html += '<div class="env-panel">';
    html += '<div class="env-panel-header env-a">Env A Validation</div>';
    html += renderEnvValidationCompact(validation.a);
    html += "</div>";

    // Env B
    html += '<div class="env-panel">';
    html += '<div class="env-panel-header env-b">Env B Validation</div>';
    html += renderEnvValidationCompact(validation.b);
    html += "</div>";

    html += "</div>";

    return html;
  }


  /* ---------------------------------------------------------------
     Render Differences Table
  --------------------------------------------------------------- */
  function renderDifferencesTable(data) {
    const { only_in_a, only_in_b, different_values, validation } = data;

    let rows = "";

    // Only in A
    only_in_a.forEach((key) => {
      const valA = validation.a.validated[key];
      rows += `
        <tr>
          <td class="key-cell">${escapeHtml(key)}</td>
          <td><span class="diff-badge only-a"><i class="bi bi-dash"></i> Only in A</span></td>
          <td class="value-cell">${escapeHtml(formatValue(valA))}</td>
          <td class="text-muted">—</td>
        </tr>
      `;
    });

    // Only in B
    only_in_b.forEach((key) => {
      const valB = validation.b.validated[key];
      rows += `
        <tr>
          <td class="key-cell">${escapeHtml(key)}</td>
          <td><span class="diff-badge only-b"><i class="bi bi-plus"></i> Only in B</span></td>
          <td class="text-muted">—</td>
          <td class="value-cell">${escapeHtml(formatValue(valB))}</td>
        </tr>
      `;
    });

    // Different values
    different_values.forEach((key) => {
      const valA = validation.a.validated[key];
      const valB = validation.b.validated[key];
      rows += `
        <tr>
          <td class="key-cell">${escapeHtml(key)}</td>
          <td><span class="diff-badge different"><i class="bi bi-arrow-left-right"></i> Different</span></td>
          <td class="value-cell">${escapeHtml(formatValue(valA))}</td>
          <td class="value-cell">${escapeHtml(formatValue(valB))}</td>
        </tr>
      `;
    });

    if (!rows) {
      return '<div class="section-body empty">No differences found</div>';
    }

    return `
      <table class="data-table">
        <thead>
          <tr>
            <th>Variable</th>
            <th>Status</th>
            <th>Value A</th>
            <th>Value B</th>
          </tr>
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

    let html = '<div style="padding: 0.75rem;">';

    // Mini stats
    html += '<div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem;">';
    html += `<span class="diff-badge" style="background: rgba(16,185,129,0.1); color: #047857;"><i class="bi bi-check"></i> ${validatedCount} valid</span>`;
    if (missing.length)
      html += `<span class="diff-badge" style="background: rgba(239,68,68,0.1); color: #dc2626;"><i class="bi bi-x"></i> ${missing.length} missing</span>`;
    if (invalid.length)
      html += `<span class="diff-badge" style="background: rgba(245,158,11,0.1); color: #b45309;"><i class="bi bi-exclamation"></i> ${invalid.length} invalid</span>`;
    if (extra.length)
      html += `<span class="diff-badge" style="background: rgba(99,102,241,0.1); color: #4f46e5;"><i class="bi bi-plus"></i> ${extra.length} extra</span>`;
    html += "</div>";

    // Issues list
    if (missing.length) {
      html += '<div style="margin-bottom: 0.5rem;"><small class="text-muted">Missing:</small>';
      html += `<div style="font-family: monospace; font-size: 0.75rem; color: #dc2626;">${missing.map(escapeHtml).join(", ")}</div></div>`;
    }

    if (invalid.length) {
      html += '<div><small class="text-muted">Invalid:</small>';
      invalid.forEach((item) => {
        html += `<div style="font-family: monospace; font-size: 0.75rem;"><span style="color: #b45309;">${escapeHtml(item.key)}</span>: ${escapeHtml(item.reason)}</div>`;
      });
      html += "</div>";
    }

    if (!missing.length && !invalid.length && validatedCount > 0) {
      html +=
        '<div style="color: #047857; font-size: 0.875rem;"><i class="bi bi-check-circle me-1"></i>All variables valid</div>';
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
    return `
      <div class="result-section">
        <div class="section-header ${type}">
          <i class="bi ${icon}"></i>
          ${title}
        </div>
        ${typeof body === "string" && body.startsWith("<div") ? body : '<div class="section-body">' + body + "</div>"}
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
    items.forEach((item) => {
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
    return `
      <ul class="simple-list">
        ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    `;
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

      const envFile = document.getElementById("envFile").files[0];
      const schema = schemaSelect.value;
      const schemaFileInput = document.getElementById("schemaFile");

      if (!envFile) {
        alert("Please select a .env file.");
        return;
      }

      const formData = new FormData();
      formData.append("file", envFile);

      let url = "/validate";

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

      const envA = document.getElementById("envA").files[0];
      const envB = document.getElementById("envB").files[0];
      const schema = schemaSelect.value;
      const schemaFileInput = document.getElementById("schemaFile");

      if (!envA || !envB) {
        alert("Please select both env files.");
        return;
      }

      const formData = new FormData();
      formData.append("env_a", envA);
      formData.append("env_b", envB);

      let url = "/compare";

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
})();
