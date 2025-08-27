// src/utils/syntaxImports.jsx
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";

// ✅ Language definitions
import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import python from "react-syntax-highlighter/dist/esm/languages/hljs/python";
import php from "react-syntax-highlighter/dist/esm/languages/hljs/php";
import ruby from "react-syntax-highlighter/dist/esm/languages/hljs/ruby";
import csharp from "react-syntax-highlighter/dist/esm/languages/hljs/csharp";
import typescript from "react-syntax-highlighter/dist/esm/languages/hljs/typescript";
import sql from "react-syntax-highlighter/dist/esm/languages/hljs/sql";
import xml from "react-syntax-highlighter/dist/esm/languages/hljs/xml";
import yaml from "react-syntax-highlighter/dist/esm/languages/hljs/yaml";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import html from "react-syntax-highlighter/dist/esm/languages/hljs/xml"; // ✅ alias

// ✅ Register once
SyntaxHighlighter.registerLanguage("javascript", js);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("php", php);
SyntaxHighlighter.registerLanguage("ruby", ruby);
SyntaxHighlighter.registerLanguage("csharp", csharp);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("sql", sql);
SyntaxHighlighter.registerLanguage("xml", xml);
SyntaxHighlighter.registerLanguage("yaml", yaml);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("html", html);

export default SyntaxHighlighter;
