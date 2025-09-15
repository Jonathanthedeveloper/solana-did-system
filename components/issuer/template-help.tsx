"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TemplateHelpPanel() {
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Template authoring guide</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-2">
          Use a JSON schema with a top-level <code>properties</code> object and
          an optional <code>required</code> array.
        </p>
        <ol className="list-decimal list-inside mb-2 text-sm">
          <li>
            Define field names under <code>properties</code>.
          </li>
          <li>
            Each field should have a <code>type</code> (string | number |
            boolean) and optional <code>title</code>.
          </li>
          <li>
            Mark required fields using the <code>required</code> array.
          </li>
        </ol>
        <div className="font-medium mb-1">Example</div>
        <pre className="bg-gray-900 text-white p-2 rounded text-xs overflow-auto">{`{
  "properties": {
    "name": { "type": "string", "title": "Full name" },
    "degree": { "type": "string", "title": "Degree" },
    "graduationYear": { "type": "number", "title": "Graduation year" }
  },
  "required": ["name", "degree"]
}`}</pre>
      </CardContent>
    </Card>
  );
}

export default TemplateHelpPanel;
