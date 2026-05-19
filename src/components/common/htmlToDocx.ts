import { Document, Packer, Paragraph, TextRun, HeadingLevel, convertInchesToTwip } from "docx";

export const htmlToDocxBlob = async (html: string): Promise<Blob> => {
  // Simple parser to extract paragraphs and text formatting from HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  
  const children: Paragraph[] = [];

  const parseNode = (node: Node, formatting: Record<string, boolean> = {}): TextRun[] => {
    const runs: TextRun[] = [];
    
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent && node.textContent.trim().length > 0) {
        runs.push(new TextRun({
          text: node.textContent,
          bold: formatting.bold,
          italics: formatting.italics,
          strike: formatting.strike,
        }));
      } else if (node.textContent && node.textContent.includes(" ")) {
        runs.push(new TextRun({
          text: " ",
          bold: formatting.bold,
          italics: formatting.italics,
          strike: formatting.strike,
        }));
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const newFormatting = { ...formatting };
      
      if (el.tagName === "STRONG" || el.tagName === "B") newFormatting.bold = true;
      if (el.tagName === "EM" || el.tagName === "I") newFormatting.italics = true;
      if (el.tagName === "S" || el.tagName === "STRIKE") newFormatting.strike = true;
      
      Array.from(node.childNodes).forEach(child => {
        runs.push(...parseNode(child, newFormatting));
      });
    }
    
    return runs;
  };

  Array.from(doc.body.children).forEach(el => {
    if (el.tagName === "P") {
      children.push(new Paragraph({
        children: parseNode(el),
        spacing: { after: 200 }
      }));
    } else if (el.tagName.match(/^H[1-6]$/)) {
      const levelMatch = el.tagName.match(/^H([1-6])$/);
      const level = levelMatch ? parseInt(levelMatch[1]) : 1;
      const headingMap = {
        1: HeadingLevel.HEADING_1,
        2: HeadingLevel.HEADING_2,
        3: HeadingLevel.HEADING_3,
        4: HeadingLevel.HEADING_4,
        5: HeadingLevel.HEADING_5,
        6: HeadingLevel.HEADING_6,
      } as const;
      const heading = headingMap[level as keyof typeof headingMap] || HeadingLevel.HEADING_1;
      children.push(new Paragraph({
        text: el.textContent || "",
        heading: heading,
        spacing: { before: 240, after: 120 }
      }));
    } else if (el.tagName === "UL" || el.tagName === "OL") {
      Array.from(el.children).forEach(li => {
        if (li.tagName === "LI") {
          children.push(new Paragraph({
            children: parseNode(li),
            bullet: el.tagName === "UL" ? { level: 0 } : undefined,
            numbering: el.tagName === "OL" ? { reference: "my-numbering", level: 0 } : undefined,
          }));
        }
      });
    }
  });

  if (children.length === 0) {
    children.push(new Paragraph({ text: " " }));
  }

  const document = new Document({
    numbering: {
      config: [
        {
          reference: "my-numbering",
          levels: [
            {
              level: 0,
              format: "decimal",
              text: "%1.",
              alignment: "left",
              style: {
                paragraph: {
                  indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) },
                },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  return await Packer.toBlob(document);
};
