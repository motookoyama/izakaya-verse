{

  "spec_id": "izakaya_v2_foundation",

  "title": "IZAKAYA V2 Card Foundation Spec (Phase 1, Unified)",

  "version": "0.09",

  "updated": "2025-09-04",

  "scope": "phase1-ui-only",

  "formats": {

    "png": {

      "chunks": [

        "tEXt",

        "iTXt",

        "zTXt"

      ],

      "encoding": "utf-8",

      "compression": {

        "iTXt": {

          "compressionFlag": [

            0,

            1

          ],

          "compressionMethod": [

            0

          ]

        },

        "zTXt": {

          "compressionMethod": [

            0

          ],

          "note": "deflate"

        }

      },

      "extraction_steps": "Extract PNG chunks (tEXt/iTXt/zTXt). If multiple 'chara' keys exist, keep the last. Decode according to type. Normalize to UTF-8 text. Validate JSON parse.",

      "fallbacks": "If zTXt deflate unsupported, show error E_PNG_EXTRACT and offer JSON/.sAtd import."

    },

    "json": {

      "charset": "utf-8",

      "root": "object"

    },

    "sAtd": {

      "charset": "utf-8",

      "root": "object",

      "note": "json-compatible text"

    }

  },

  "normalization": {

    "name_priority": [

      "name",

      "character",

      "title",

      "data.name"

    ],

    "first_mes_priority": [

      "data.first_mes",

      "spec.first_mes",

      "card.first_mes",

      "first_mes"

    ],

    "behavior_priority": [

      "description",

      "system_prompt",

      "behavior",

      "data.description"

    ],

    "links_priority": [

      "links",

      "data.links"

    ],

    "icon_priority": [

      "icon",

      "meta.icon"

    ],

    "defaults": {

      "icon": "🃏",

      "links": []

    }

  },

  "api": {

    "list": {

      "method": "GET",

      "path": "/api/v2/cards",

      "response": {

        "shape": "items[] or []",

        "required_keys": [

          "id",

          "name"

        ]

      }

    },

    "detail": {

      "method": "GET",

      "path": "/api/v2/cards/{id}",

      "response": {

        "shape": "object",

        "note": "normalizable to internal schema"

      }

    },

    "save": {

      "method": "PUT",

      "path": "/api/v2/cards/{id}",

      "body_required": [

        "id",

        "name"

      ],

      "alt": {

        "method": "POST",

        "path": "/api/v2/cards"

      }

    },

    "reload": {

      "required": false,

      "path": null,

      "note": "not required, UI reloads from memory"

    },

    "cors": {

      "allow_origins": [

        "http://localhost:5173"

      ],

      "note": "expand as needed"

    }

  },

  "internal_schema": {

    "type": "json-schema-draft-2020-12",

    "schema": {

      "$schema": "https://json-schema.org/draft/2020-12/schema",

      "title": "IZAKAYA V2 Internal Schema",

      "type": "object",

      "properties": {

        "id": {

          "type": "string"

        },

        "name": {

          "type": "string"

        },

        "first_mes": {

          "type": "string"

        },

        "behavior": {

          "type": "string"

        },

        "links": {

          "type": "array",

          "items": {

            "type": "object",

            "properties": {

              "title": {

                "type": "string"

              },

              "url": {

                "type": "string",

                "format": "uri"

              }

            },

            "required": [

              "title",

              "url"

            ]

          }

        },

        "icon": {

          "type": "string"

        }

      },

      "required": [

        "id",

        "name"

      ]

    },

    "required": [

      "id",

      "name"

    ],

    "fields": {

      "id": "string",

      "name": "string",

      "first_mes": "string",

      "behavior": "string",

      "links": "array[{title,url}]",

      "icon": "string"

    }

  },

  "validation": {

    "rules": [

      "required fields present",

      "types match",

      "links[] items valid"

    ],

    "errors": [

      {

        "code": "E_PARSE",

        "message": "Failed to parse JSON"

      },

      {

        "code": "E_REQUIRED",

        "message": "Required field missing"

      },

      {

        "code": "E_PNG_EXTRACT",

        "message": "Failed to extract/deflate PNG embedded JSON"

      }

    ],

    "ui_guidance": "Show error messages in UI; guide user to import JSON/.sAtd if PNG fails"

  },

  "security": {

    "forbidden": [

      "password",

      "token",

      "api_key"

    ],

    "handling": "Keep secrets in .env/Secrets; never in card text."

  },

  "i18n": {

    "jp_ui_mode": {

      "phase1": "display only",

      "future": "translation hook"

    }

  },

  "golden_master": {

    "gm1_json": {

      "spec": "chara_card_v2",

      "spec_version": "2.0",

      "data": {

        "name": "TestChar",

        "description": "Minimal character",

        "first_mes": "Hello.",

        "mes_example": "<START>\n{{user}}: hi\n{{char}}: hello"

      }

    },

    "gm2_satd": {

      "spec": "chara_card_v2",

      "spec_version": "2.0",

      "data": {

        "name": "TestChar",

        "description": "Minimal character",

        "first_mes": "Hello.",

        "mes_example": "<START>\n{{user}}: hi\n{{char}}: hello"

      }

    },

    "gm3_png": "PNG with single iTXt chunk 'chara', compressionFlag=0, UTF-8 JSON string identical to gm1_json.",

    "normalization_expectation": "All 3 normalize to identical internal object"

  },

  "acceptance": {

    "import": [

      "json",

      ".sAtd",

      "png"

    ],

    "display": [

      "name",

      "first_mes",

      "behavior",

      "links",

      "icon"

    ],

    "save": [

      "PUT/POST success",

      "re-fetch equals saved"

    ],

    "failure_cases": [

      "broken json",

      "png deflate unsupported",

      "missing required"

    ]

  },

  "glossary": {

    "first_mes": "初回メッセージ。チャット開始時にキャラが発する文言",

    "behavior": "キャラクターの性格・行動指針。通常 description/system_prompt を含む",

    "v2/v3": "SillyTavernのキャラカードバージョン。v2とv3は互換設計"

  },

  "appendix": {

    "examples": [

      {

        "list_response": {

          "items": [

            {

              "id": "c1",

              "name": "Alice"

            }

          ]

        }

      },

      {

        "detail_response": {

          "id": "c1",

          "name": "Alice",

          "first_mes": "Hi",

          "behavior": "Friendly"

        }

      },

      {

        "save_request": {

          "id": "c1",

          "name": "Alice"

        }

      }

    ]

  },

  "codex_faq": {

    "q1": {

      "question": "なぜ PNG で SillyTavern が読み込めないことがあるのか？",

      "answer": "iTXt チャンクの仕様違反（圧縮フラグや BOM）が原因。必ず compressionFlag=0, UTF-8 BOMなし で書き込むこと。"

    },

    "q2": {

      "question": "name と title が両方あるときは？",

      "answer": "正規化ルールに従い name > character > title > data.name の順で決定する。"

    },

    "q3": {

      "question": "保存 API で POST と PUT はどう使い分ける？",

      "answer": "新規は POST /api/v2/cards, 更新は PUT /api/v2/cards/{id}。重複 id があればエラー。"

    },

    "q4": {

      "question": "v2 と v3 の違いは？",

      "answer": "構造は互換。v3 には追加キーがあるが、本仕様では v2 を最低限として互換処理する。"

    },

    "q5": {

      "question": "検証失敗時のエラーコードは？",

      "answer": "JSON parse失敗=E_PARSE、必須欠落=E_REQUIRED、PNG抽出失敗=E_PNG_EXTRACT。"

    }

  }

}