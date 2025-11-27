import * as React from "react";
import { Copy } from "lucide-react";

export default function WidgetConfigurationContent() {
  const widgetCode = `<!-- Start of Western.to Script -->\n<script type=\"text/javascript\">\nvar Western_API=Western_API||{}; The Western_API=Western_API||function(){};\nvar s1=document.createElement(\"script\"),s0=document.getElementsByTagName`;
  return (
    <div className="w-full max-w-5xl mx-auto px-0 sm:px-4">
      <h2 className="text-xl font-semibold text-white mb-6">Install Widget</h2>
      <div className="bg-[#23242A] rounded-2xl p-2 sm:p-10 border border-[#23242A] w-full">
        <p className="text-muted-foreground mb-6">To install Western Treasury, you can place this code before the <code className='text-white'>&lt;/body&gt;</code> tag on every page of your website</p>
        <div className="bg-[#19191d] rounded-lg p-2 sm:p-8 text-white font-mono text-sm relative min-h-[160px]">
          <pre className="whitespace-pre-wrap break-words">{widgetCode}</pre>
          <button className="absolute bottom-4 right-4 p-2 bg-[#23242A] rounded-md hover:bg-[#35373F]" title="Copy">
            <Copy className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
