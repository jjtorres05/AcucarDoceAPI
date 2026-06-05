const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak
} = require("docx");

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

function headerCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: "2B579A", type: ShadingType.CLEAR },
    margins: cellMargins,
    verticalAlign: "center",
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", font: "Arial", size: 20 })] })],
  });
}

function cell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, font: "Arial", size: 20 })] })],
  });
}

function boldCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, font: "Arial", size: 20, bold: true })] })],
  });
}

function codeCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
    margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, font: "Consolas", size: 18 })] })],
  });
}

function heading1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 200 }, children: [new TextRun({ text, font: "Arial" })] });
}

function heading2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 160 }, children: [new TextRun({ text, font: "Arial" })] });
}

function para(text) {
  return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text, font: "Arial", size: 20 })] });
}

function boldPara(text) {
  return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text, font: "Arial", size: 20, bold: true })] });
}

function bullet(text, ref) {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 60 },
    children: [new TextRun({ text, font: "Arial", size: 20 })],
  });
}

function numberedItem(text, ref) {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, font: "Arial", size: 20 })],
  });
}

function endpointRow(method, url, desc) {
  return new TableRow({
    children: [
      new TableCell({
        borders,
        width: { size: 1200, type: WidthType.DXA },
        shading: { fill: "E8F0FE", type: ShadingType.CLEAR },
        margins: cellMargins,
        children: [new Paragraph({ children: [new TextRun({ text: method, font: "Consolas", size: 18, bold: true })] })],
      }),
      new TableCell({
        borders,
        width: { size: 4160, type: WidthType.DXA },
        shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
        margins: cellMargins,
        children: [new Paragraph({ children: [new TextRun({ text: url, font: "Consolas", size: 18 })] })],
      }),
      cell(desc, 4000),
    ],
  });
}

function endpointTable(rows) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1200, 4160, 4000],
    rows: [
      new TableRow({ children: [headerCell("Metodo", 1200), headerCell("URL", 4160), headerCell("Descripcion", 4000)] }),
      ...rows,
    ],
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 20 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: "2B579A" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: "404040" },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "flow", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "AcucarDoce API - Guia Rapida", font: "Arial", size: 16, color: "999999", italics: true })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Pagina ", font: "Arial", size: 16, color: "999999" }), new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: "999999" })],
          })],
        }),
      },
      children: [
        // TITLE
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "AcucarDoce API", font: "Arial", size: 48, bold: true, color: "2B579A" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "Guia Rapida", font: "Arial", size: 28, color: "666666" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: "Base URL: http://localhost:7071/api", font: "Consolas", size: 22, color: "2B579A" })] }),

        // AUTENTICACION
        heading1("Autenticacion"),
        bullet("Todas las rutas requieren token JWT (excepto login y enviar leitura)", "bullets"),
        bullet("Se envia como: Authorization: Bearer {token}", "bullets"),
        bullet("Tambien se acepta cookie httpOnly auth_token", "bullets"),
        bullet("Todas las rutas requieren empresaId en la query string", "bullets"),

        // ROLES
        heading1("Roles y Permisos"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3120, 6240],
          rows: [
            new TableRow({ children: [headerCell("Rol", 3120), headerCell("Permisos", 6240)] }),
            new TableRow({ children: [boldCell("admin_interno", 3120), cell("Todo en todas las empresas", 6240)] }),
            new TableRow({ children: [boldCell("admin_externo", 3120), cell("Todo dentro de su empresa", 6240)] }),
            new TableRow({ children: [boldCell("externo_comum", 3120), cell("Solo listar", 6240)] }),
          ],
        }),

        // AUTH
        new Paragraph({ children: [new PageBreak()] }),
        heading1("Endpoints"),
        heading2("AUTH"),
        para("No requiere empresaId."),
        endpointTable([
          endpointRow("POST", "/auth", "Login. Body: { email, senha }. Retorna: token"),
          endpointRow("GET", "/auth", "Listar empresas. Retorna: array con id y nome"),
          endpointRow("POST", "/auth?acao=registro", "Registrar usuario (solo admin)"),
        ]),

        // DISPOSITIVOS
        heading2("DISPOSITIVOS"),
        para("Auth: Bearer token. Query: empresaId. Permiso para crear/editar/deletar: admin_interno o admin_externo."),
        endpointTable([
          endpointRow("POST", "/dispositivos", "Crear. Body: { nome_modelo }. Retorna: id + token_dispositivo"),
          endpointRow("GET", "/dispositivos", "Listar todos"),
          endpointRow("GET", "/dispositivos?id={id}", "Obtener por ID"),
          endpointRow("PUT", "/dispositivos", "Actualizar. Body: { id, nome_modelo? }"),
          endpointRow("PATCH", "/dispositivos?id={id}", "Desactivar"),
          endpointRow("DELETE", "/dispositivos?id={id}", "Deletar"),
          endpointRow("POST", "/dispositivos?acao=regenerar-token&id={id}", "Regenerar token"),
        ]),
        boldPara("Importante: Guardar el id y token_dispositivo al crear. El token solo se muestra una vez."),

        // SENSORES
        heading2("SENSORES"),
        para("Auth: Bearer token. Query: empresaId. Permiso para crear/editar/deletar: admin_interno o admin_externo."),
        endpointTable([
          endpointRow("POST", "/sensores", "Crear. Body: { dispositivo_id, nome_modelo, tipo_sensor, unidade }"),
          endpointRow("GET", "/sensores", "Listar. Filtro opcional: dispositivoId"),
          endpointRow("GET", "/sensores?id={id}", "Obtener por ID"),
          endpointRow("PUT", "/sensores", "Actualizar. Body: { id, nome_modelo?, tipo_sensor?, unidade? }"),
          endpointRow("PATCH", "/sensores?id={id}", "Desactivar"),
          endpointRow("DELETE", "/sensores?id={id}", "Deletar"),
        ]),

        // ATUADORES
        new Paragraph({ children: [new PageBreak()] }),
        heading2("ATUADORES"),
        para("Auth: Bearer token. Query: empresaId. Permiso para crear/editar/deletar: admin_interno o admin_externo."),
        endpointTable([
          endpointRow("POST", "/atuadores", "Crear. Body: { dispositivo_id, nome_modelo, tipo }"),
          endpointRow("GET", "/atuadores", "Listar. Filtro opcional: dispositivoId"),
          endpointRow("GET", "/atuadores?id={id}", "Obtener por ID"),
          endpointRow("PUT", "/atuadores", "Actualizar. Body: { id, nome_modelo?, tipo? }"),
          endpointRow("PATCH", "/atuadores?id={id}", "Desactivar"),
          endpointRow("DELETE", "/atuadores?id={id}", "Deletar"),
        ]),

        // ALERTAS
        heading2("ALERTAS"),
        para("Auth: Bearer token. Query: empresaId. Permiso para crear/deletar: admin_interno o admin_externo."),
        endpointTable([
          endpointRow("POST", "/alertas", "Crear. Body: { dispositivo_id, sensor_id, tipo, mensagem }"),
          endpointRow("GET", "/alertas", "Listar. Filtros opcionales: dispositivoId, sensorId"),
          endpointRow("GET", "/alertas?id={id}", "Obtener por ID"),
          endpointRow("DELETE", "/alertas?id={id}", "Deletar"),
        ]),

        // LEITURAS
        heading2("LEITURAS"),
        para("El POST lo hace el dispositivo IoT (sin Bearer token). El GET lo hacen los usuarios."),
        endpointTable([
          endpointRow("POST", "/leituras?dispositivoId={id}&empresaId={id}", "Enviar leitura. Body: { token_dispostivo, sensor_id, valor }"),
          endpointRow("GET", "/leituras", "Listar. Filtros: dispositivoId, sensorId, id, inicio, fim"),
        ]),

        // LOGS
        heading2("LOGS"),
        para("Solo lectura. Se generan automaticamente. Auth: Bearer token. Query: empresaId."),
        endpointTable([
          endpointRow("GET", "/logs", "Listar. Filtros opcionales: dispositivoId, id"),
        ]),

        // FLUJO RAPIDO
        new Paragraph({ children: [new PageBreak()] }),
        heading1("Flujo Rapido"),
        para("Pasos para empezar desde cero a enviar lecturas de sensores:"),
        numberedItem("POST /auth  ->  guardar token", "flow"),
        numberedItem("GET /auth  ->  guardar empresaId", "flow"),
        numberedItem("POST /dispositivos  ->  guardar dispositivoId + token_dispositivo", "flow"),
        numberedItem("POST /sensores  ->  guardar sensorId", "flow"),
        numberedItem("POST /leituras  ->  enviar lecturas (lo hace el IoT)", "flow"),
        numberedItem("GET /leituras  ->  consultar lecturas (lo hace el usuario)", "flow"),

        // CODIGOS DE ERROR
        heading1("Codigos de Error"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [1500, 7860],
          rows: [
            new TableRow({ children: [headerCell("Codigo", 1500), headerCell("Significado", 7860)] }),
            new TableRow({ children: [boldCell("400", 1500), cell("Datos invalidos o faltantes", 7860)] }),
            new TableRow({ children: [boldCell("401", 1500), cell("No autenticado (token ausente o invalido)", 7860)] }),
            new TableRow({ children: [boldCell("403", 1500), cell("Sin permiso para esta accion", 7860)] }),
            new TableRow({ children: [boldCell("404", 1500), cell("Recurso no encontrado", 7860)] }),
            new TableRow({ children: [boldCell("409", 1500), cell("Conflicto (dato duplicado)", 7860)] }),
            new TableRow({ children: [boldCell("500", 1500), cell("Error interno del servidor", 7860)] }),
          ],
        }),
      ],
    },
  ],
});

const outputPath = process.argv[2] || "AcucarDoceAPI-Guia.docx";
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  console.log("Documento creado: " + outputPath);
});
