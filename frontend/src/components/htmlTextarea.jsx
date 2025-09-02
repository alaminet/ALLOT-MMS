import React from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Alignment,
  Essentials,
  Autoformat,
  Bold,
  Italic,
  BlockQuote,
  CloudServices,
  FontSize,
  FontFamily,
  Heading,
  Highlight,
  Image,
  ImageUpload,
  Link,
  List,
  Paragraph,
  PasteFromOffice,
  Strikethrough,
  Table,
  TableCaption,
  TableCellProperties,
  TableProperties,
  TableToolbar,
  TableColumnResize,
  Underline,
} from "ckeditor5";
const HTMLTextarea = ({ onChange, defaultData }) => {
  return (
    <>
      <CKEditor
        editor={ClassicEditor}
        onChange={(event, editor) => {
          onChange(editor.getData());
        }}
        config={{
          resize_enabled: true,
          licenseKey: "GPL", // Or 'GPL'.
          plugins: [
            CloudServices,
            Essentials,
            Alignment,
            Autoformat,
            Bold,
            Italic,
            BlockQuote,
            FontFamily,
            FontSize,
            Heading,
            Highlight,
            Image,
            ImageUpload,
            Link,
            List,
            Paragraph,
            PasteFromOffice,
            Strikethrough,
            Table,
            TableCaption,
            TableCellProperties,
            TableProperties,
            TableToolbar,
            TableColumnResize,
            Underline,
          ],
          toolbar: {
            items: [
              "heading",
              "|",
              "fontsize",
              "fontfamily",
              "|",
              "bold",
              "italic",
              "underline",
              "strikethrough",
              "highlight",
              "|",
              "alignment",
              "|",
              "numberedList",
              "bulletedList",
              "|",
              "insertTable",
              "undo",
              "redo",
            ],
          },
          table: {
            contentToolbar: [
              "tableColumn",
              "tableRow",
              "mergeTableCells",
              "tableProperties",
              "tableCellProperties",
              "toggleTableCaption",
            ],
            tableToolbar: ["bold", "italic"],
          },
          initialData: defaultData || "",
        }}
      />
    </>
  );
};

export default HTMLTextarea;
