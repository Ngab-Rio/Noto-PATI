import { describe, expect, it } from "vitest";
import { parseFormattedNumber, parseDjpkXmlSpreadsheet, extractPortalKeterangan, ApbdParseError } from "./parser";

describe("APBD Scraper Parser", () => {
  describe("parseFormattedNumber", () => {
    it("handles number types directly", () => {
      expect(parseFormattedNumber(123456)).toBe(123456);
      expect(parseFormattedNumber(9.14)).toBe(9.14);
    });

    it("parses unformatted integers", () => {
      expect(parseFormattedNumber("2719861122000")).toBe(2719861122000);
      expect(parseFormattedNumber("0")).toBe(0);
    });

    it("parses decimal numbers with dot or comma", () => {
      expect(parseFormattedNumber("9.14")).toBe(9.14);
      expect(parseFormattedNumber("9,14")).toBe(9.14);
      expect(parseFormattedNumber("194.34")).toBe(194.34);
    });

    it("parses formatted Indonesian currency numbers", () => {
      expect(parseFormattedNumber("1.234.567,89")).toBe(1234567.89);
      expect(parseFormattedNumber("2.719.861.122.000")).toBe(2719861122000);
    });

    it("returns 0 on empty input", () => {
      expect(parseFormattedNumber("")).toBe(0);
    });
  });

  describe("parseDjpkXmlSpreadsheet", () => {
    const validXml = `<?xml version="1.0" encoding="UTF-8"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Data APBD">
    <Table>
      <Row>
        <Cell><Data ss:Type="String">Akun</Data></Cell>
        <Cell><Data ss:Type="String">Anggaran</Data></Cell>
        <Cell><Data ss:Type="String">Realisasi</Data></Cell>
        <Cell><Data ss:Type="String">Persentase</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String"> Pendapatan Daerah</Data></Cell>
        <Cell><Data ss:Type="Number">2719861122000</Data></Cell>
        <Cell><Data ss:Type="Number">248568536414</Data></Cell>
        <Cell><Data ss:Type="String">9.14</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String"> Belanja Daerah</Data></Cell>
        <Cell><Data ss:Type="Number">2867861122000</Data></Cell>
        <Cell><Data ss:Type="Number">102520071453</Data></Cell>
        <Cell><Data ss:Type="String">3.57</Data></Cell>
      </Row>
    </Table>
  </Worksheet>
</Workbook>`;

    it("successfully parses valid XML spreadsheet", () => {
      const rows = parseDjpkXmlSpreadsheet(validXml);
      expect(rows).toHaveLength(2);
      expect(rows[0]).toEqual({
        akun: "Pendapatan Daerah",
        anggaran: 2719861122000,
        realisasi: 248568536414,
        persentase: 9.14,
      });
      expect(rows[1]).toEqual({
        akun: "Belanja Daerah",
        anggaran: 2867861122000,
        realisasi: 102520071453,
        persentase: 3.57,
      });
    });

    it("throws ApbdParseError when content is empty or invalid XML", () => {
      expect(() => parseDjpkXmlSpreadsheet("")).toThrow(ApbdParseError);
      expect(() => parseDjpkXmlSpreadsheet("<html>Not spreadsheet</html>")).toThrow(ApbdParseError);
    });

    it("throws ApbdParseError when header structure is missing", () => {
      const noHeaderXml = `<?xml version="1.0"?>
<Workbook><Table>
  <Row><Cell><Data ss:Type="String">ColA</Data></Cell></Row>
</Table></Workbook>`;
      expect(() => parseDjpkXmlSpreadsheet(noHeaderXml)).toThrow(ApbdParseError);
    });

    it("throws ApbdParseError when numbers are malformed", () => {
      const badNumXml = `<?xml version="1.0"?>
<Workbook><Table>
  <Row>
    <Cell><Data ss:Type="String">Akun</Data></Cell>
    <Cell><Data ss:Type="String">Anggaran</Data></Cell>
    <Cell><Data ss:Type="String">Realisasi</Data></Cell>
    <Cell><Data ss:Type="String">Persentase</Data></Cell>
  </Row>
  <Row>
    <Cell><Data ss:Type="String">Test</Data></Cell>
    <Cell><Data ss:Type="String">BukanAngka</Data></Cell>
    <Cell><Data ss:Type="String">100</Data></Cell>
    <Cell><Data ss:Type="String">10</Data></Cell>
  </Row>
</Table></Workbook>`;
      expect(() => parseDjpkXmlSpreadsheet(badNumXml)).toThrow(ApbdParseError);
    });
  });

  describe("extractPortalKeterangan", () => {
    it("extracts keterangan label from HTML", () => {
      const html = `<div><label id="keterangan" class="miring-kanan">Keterangan: Data APBD Murni, realisasi APBD s.d Januari 2026</label></div>`;
      const ket = extractPortalKeterangan(html);
      expect(ket).toBe("Keterangan: Data APBD Murni, realisasi APBD s.d Januari 2026");
    });

    it("returns undefined if label not found", () => {
      expect(extractPortalKeterangan("<div>No label</div>")).toBeUndefined();
    });
  });
});

