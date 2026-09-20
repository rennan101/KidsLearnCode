# 🗄️ Database & Account State Schema

#database #schema #sql #nosql #mmo #persistence

---

## 📊 Modelagem de Entidades Relacionais

```mermaid
erDiagram
    USERS ||--o{ CHARACTERS : owns
    CHARACTERS ||--o{ INVENTORIES : carries
    CHARACTERS ||--|| HOUSES : owns
    HOUSES ||--o{ FURNITURE_SLOTS : contains
    CHARACTERS ||--o{ LUA_CHALLENGE_PROGRESS : completed

    USERS {
        uuid id PK
        string email
        string password_hash
        timestamp created_at
    }

    CHARACTERS {
        uuid id PK
        uuid user_id FK
        string name
        int level
        int coins
        float posX
        float posY
        string direction
    }

    INVENTORIES {
        uuid id PK
        uuid character_id FK
        string item_id
        int quantity
        int slot_index
    }

    HOUSES {
        uuid id PK
        uuid character_id FK
        int house_tier
        int grid_width
        int grid_height
    }

    FURNITURE_SLOTS {
        uuid id PK
        uuid house_id FK
        string item_id
        int grid_x
        int grid_y
        int rotation
    }

    LUA_CHALLENGE_PROGRESS {
        uuid id PK
        uuid character_id FK
        int challenge_id
        text blockly_xml
        text generated_lua
        boolean passed
        timestamp completed_at
    }
```

---

## 🔗 Links Relacionados
* [[Web MMO Client-Server Architecture]]
* [[Lua Island Educational Gameplay (Blockly & Lua)]]
* [[State Persistence & Auto-Save Protocol]]
