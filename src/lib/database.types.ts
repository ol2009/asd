export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            classes: {
                Row: {
                    id: string
                    name: string
                    grade: string
                    subject: string
                    description: string | null
                    cover_image: string | null
                    school_name: string | null
                    created_at: string
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    id?: string
                    name: string
                    grade: string
                    subject: string
                    description?: string | null
                    cover_image?: string | null
                    school_name?: string | null
                    created_at?: string
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    id?: string
                    name?: string
                    grade?: string
                    subject?: string
                    description?: string | null
                    cover_image?: string | null
                    school_name?: string | null
                    created_at?: string
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "classes_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            students: {
                Row: {
                    id: string
                    name: string
                    number: number
                    class_id: string
                    honorific: string | null
                    icon_type: string | null
                    level: number
                    exp: number
                    points: number
                    created_at: string
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    number: number
                    class_id: string
                    honorific?: string | null
                    icon_type?: string | null
                    level?: number
                    exp?: number
                    points?: number
                    created_at?: string
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    number?: number
                    class_id?: string
                    honorific?: string | null
                    icon_type?: string | null
                    level?: number
                    exp?: number
                    points?: number
                    created_at?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "students_class_id_fkey"
                        columns: ["class_id"]
                        isOneToOne: false
                        referencedRelation: "classes"
                        referencedColumns: ["id"]
                    }
                ]
            }
            missions: {
                Row: {
                    id: string
                    name: string
                    condition: string
                    class_id: string
                    created_at: string
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    condition: string
                    class_id: string
                    created_at?: string
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    condition?: string
                    class_id?: string
                    created_at?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "missions_class_id_fkey"
                        columns: ["class_id"]
                        isOneToOne: false
                        referencedRelation: "classes"
                        referencedColumns: ["id"]
                    }
                ]
            }
            mission_achievements: {
                Row: {
                    id: string
                    student_id: string
                    mission_id: string
                    timestamp: string
                    class_id: string
                }
                Insert: {
                    id?: string
                    student_id: string
                    mission_id: string
                    timestamp?: string
                    class_id: string
                }
                Update: {
                    id?: string
                    student_id?: string
                    mission_id?: string
                    timestamp?: string
                    class_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "mission_achievements_class_id_fkey"
                        columns: ["class_id"]
                        isOneToOne: false
                        referencedRelation: "classes"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "mission_achievements_mission_id_fkey"
                        columns: ["mission_id"]
                        isOneToOne: false
                        referencedRelation: "missions"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "mission_achievements_student_id_fkey"
                        columns: ["student_id"]
                        isOneToOne: false
                        referencedRelation: "students"
                        referencedColumns: ["id"]
                    }
                ]
            }
            roadmaps: {
                Row: {
                    id: string
                    name: string
                    reward_title: string
                    icon: string
                    class_id: string
                    created_at: string
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    reward_title: string
                    icon: string
                    class_id: string
                    created_at?: string
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    reward_title?: string
                    icon?: string
                    class_id?: string
                    created_at?: string
                    updated_at?: string | null
                }
            }
            roadmap_steps: {
                Row: {
                    id: string
                    roadmap_id: string
                    goal: string
                    order_index: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    roadmap_id: string
                    goal: string
                    order_index: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    roadmap_id?: string
                    goal?: string
                    order_index?: number
                    created_at?: string
                }
            }
            roadmap_step_achievements: {
                Row: {
                    id: string
                    student_id: string
                    step_id: string
                    timestamp: string
                    class_id: string
                }
                Insert: {
                    id?: string
                    student_id: string
                    step_id: string
                    timestamp?: string
                    class_id: string
                }
                Update: {
                    id?: string
                    student_id?: string
                    step_id?: string
                    timestamp?: string
                    class_id?: string
                }
            }
            praise_cards: {
                Row: {
                    id: string
                    content: string
                    student_id: string
                    class_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    content: string
                    student_id: string
                    class_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    content?: string
                    student_id?: string
                    class_id?: string
                    created_at?: string
                }
            }
            point_shop_items: {
                Row: {
                    id: string
                    name: string
                    description: string
                    price: number
                    image_url: string | null
                    class_id: string
                    created_at: string
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    description: string
                    price: number
                    image_url?: string | null
                    class_id: string
                    created_at?: string
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string
                    price?: number
                    image_url?: string | null
                    class_id?: string
                    created_at?: string
                    updated_at?: string | null
                }
            }
            purchase_history: {
                Row: {
                    id: string
                    student_id: string
                    item_id: string
                    purchase_date: string
                    used: boolean
                    used_date: string | null
                    class_id: string
                }
                Insert: {
                    id?: string
                    student_id: string
                    item_id: string
                    purchase_date?: string
                    used?: boolean
                    used_date?: string | null
                    class_id: string
                }
                Update: {
                    id?: string
                    student_id?: string
                    item_id?: string
                    purchase_date?: string
                    used?: boolean
                    used_date?: string | null
                    class_id?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
} 