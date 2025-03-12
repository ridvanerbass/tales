"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./button";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Image,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
} from "lucide-react";
import { Textarea } from "./textarea";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface HtmlEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const HtmlEditor = ({
  value,
  onChange,
  placeholder = "İçerik girin...",
  minHeight = "300px",
}: HtmlEditorProps) => {
  const [htmlContent, setHtmlContent] = useState(value || "");
  const [showHtml, setShowHtml] = useState(false);
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");

  useEffect(() => {
    setHtmlContent(value || "");
  }, [value]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = htmlContent;
    }
  }, [htmlContent, showHtml]);

  const handleEditorChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setHtmlContent(newContent);
      onChange(newContent);
    }
  };

  const execCommand = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    handleEditorChange();
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const insertLink = () => {
    if (linkUrl) {
      execCommand("createLink", linkUrl);
      setLinkUrl("");
    }
  };

  const insertImage = () => {
    if (imageUrl) {
      const imgHtml = `<img src="${imageUrl}" alt="${imageAlt || "image"}" style="max-width: 100%; height: auto;" />`;
      document.execCommand("insertHTML", false, imgHtml);
      handleEditorChange();
      setImageUrl("");
      setImageAlt("");
    }
  };

  const handleHtmlInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHtml = e.target.value;
    setHtmlContent(newHtml);
    onChange(newHtml);
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-muted/30 p-2 border-b flex flex-wrap gap-1 items-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => execCommand("bold")}
          title="Kalın"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => execCommand("italic")}
          title="İtalik"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => execCommand("underline")}
          title="Altı Çizili"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1"></div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => execCommand("formatBlock", "<h1>")}
          title="Başlık 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => execCommand("formatBlock", "<h2>")}
          title="Başlık 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => execCommand("formatBlock", "<h3>")}
          title="Başlık 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1"></div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => execCommand("insertUnorderedList")}
          title="Madde İşaretleri"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => execCommand("insertOrderedList")}
          title="Numaralı Liste"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1"></div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => execCommand("justifyLeft")}
          title="Sola Hizala"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => execCommand("justifyCenter")}
          title="Ortala"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => execCommand("justifyRight")}
          title="Sağa Hizala"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1"></div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Bağlantı Ekle"
            >
              <Link className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium">Bağlantı Ekle</h4>
              <Input
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
              <Button
                type="button"
                size="sm"
                onClick={insertLink}
                className="w-full"
              >
                Ekle
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Resim Ekle"
            >
              <Image className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium">Resim Ekle</h4>
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <Input
                placeholder="Alternatif metin"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
              />
              <Button
                type="button"
                size="sm"
                onClick={insertImage}
                className="w-full"
              >
                Ekle
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <div className="w-px h-6 bg-border mx-1"></div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => execCommand("undo")}
          title="Geri Al"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => execCommand("redo")}
          title="Yinele"
        >
          <Redo className="h-4 w-4" />
        </Button>
        <div className="flex-1"></div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowHtml(!showHtml)}
        >
          {showHtml ? "Düzenleyici" : "HTML"}
        </Button>
      </div>

      {showHtml ? (
        <Textarea
          value={htmlContent}
          onChange={handleHtmlInputChange}
          className="min-h-[300px] font-mono text-sm p-4 rounded-none"
          style={{ minHeight }}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleEditorChange}
          className="p-4 focus:outline-none overflow-auto prose prose-sm max-w-none dark:prose-invert"
          style={{ minHeight }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          placeholder={placeholder}
        />
      )}
    </div>
  );
};

export { HtmlEditor };
