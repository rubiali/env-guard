/* ===============================================================
   Env-Guard | Frontend Logic
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
      const current = getCurrentTheme();
      setTheme(current === "dark" ? "light" : "dark");
    });
  }

  // Listen for system theme changes (if user hasn't manually set)
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      setTheme(e.matches ? "dark" : "light");
    }
  });

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
  const submitBtn = document.getElementById("submitBtn");

  let currentData = null;
  let currentMode = null;

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

      viewToggleGroup.querySelectorAll(".view-toggle-btn").forEach((b) => {
        b.classList.remove("active");
      });
      btn.classList.add("active");

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

    resultJson.textContent = JSON.stringify(data, null, 2);

    if (mode === "validate") {
      resultFormatted.innerHTML = renderValidateResult(data);
    } else {
      resultFormatted.innerHTML = renderCompareResult(data);
    }

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

    html += renderSummary({
      validated: validatedKeys.length,
      missing: missing.length,
      invalid: invalid.length,
      extra: extra.length,
    });

    if (validatedKeys.length) {
      html += renderSection(
        "success",
        "bi-check-circle",
        `Validated (${validatedKeys.length})`,
        renderKeyValueTable(validated)
      );
    }

    if (missing.length) {
      html += renderSection(
        "danger",
        "bi-x-circle",
        `Missing (${missing.length})`,
        renderSimpleList(missing)
      );
    }

    if (invalid.length) {
      html += renderSection(
        "warning",
        "bi-exclamation-triangle",
        `Invalid (${invalid.length})`,
        renderInvalidTable(invalid)
      );
    }

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

    if (only_in_a.length || only_in_b.length || different_values.length) {
      html += renderSection(
        "neutral",
        "bi-diagram-3",
        "Differences",
        renderDifferencesTable(data)
      );
    }

    html += '<div class="compare-grid">';

    html += '<div class="env-panel">';
    html += '<div class="env-panel-header env-a">Env A Validation</div>';
    html += renderEnvValidationCompact(validation.a);
    html += "</div>";

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

    let html = '<div class="env-validation-content">';

    html += '<div class="env-mini-stats">';
    html += `<span class="diff-badge" style="background: rgba(16,185,129,0.1); color: var(--brand-success);"><i class="bi bi-check"></i> ${validatedCount} valid</span>`;
    if (missing.length)
      html += `<span class="diff-badge" style="background: rgba(239,68,68,0.1); color: var(--brand-danger);"><i class="bi bi-x"></i> ${missing.length} missing</span>`;
    if (invalid.length)
      html += `<span class="diff-badge" style="background: rgba(245,158,11,0.1); color: var(--brand-warning);"><i class="bi bi-exclamation"></i> ${invalid.length} invalid</span>`;
    if (extra.length)
      html += `<span class="diff-badge" style="background: rgba(99,102,241,0.1); color: var(--brand-info);"><i class="bi bi-plus"></i> ${extra.length} extra</span>`;
    html += "</div>";

    if (missing.length) {
      html += '<div class="env-issues"><small class="env-issues-label">Missing:</small>';
      html += `<div class="env-issues-list missing">${missing.map(escapeHtml).join(", ")}</div></div>`;
    }

    if (invalid.length) {
      html += '<div class="env-issues"><small class="env-issues-label">Invalid:</small>';
      invalid.forEach((item) => {
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
