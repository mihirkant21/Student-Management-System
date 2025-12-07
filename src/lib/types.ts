export interface Database {
  public: {
    Tables: {
      departments: {
        Row: {
          id: string;
          name: string;
          code: string;
          head: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          head?: string;
          description?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          head?: string;
          description?: string;
          created_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          name: string;
          code: string;
          department_id: string | null;
          semester: number;
          credits: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          department_id?: string | null;
          semester?: number;
          credits?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          department_id?: string | null;
          semester?: number;
          credits?: number;
          created_at?: string;
        };
      };
      students: {
        Row: {
          id: string;
          name: string;
          reg_no: string;
          email: string;
          phone: string;
          department_id: string | null;
          year: number;
          address: string;
          parent_name: string;
          parent_contact: string;
          date_of_birth: string | null;
          gender: string;
          admission_date: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          reg_no: string;
          email: string;
          phone?: string;
          department_id?: string | null;
          year?: number;
          address?: string;
          parent_name?: string;
          parent_contact?: string;
          date_of_birth?: string | null;
          gender?: string;
          admission_date?: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          reg_no?: string;
          email?: string;
          phone?: string;
          department_id?: string | null;
          year?: number;
          address?: string;
          parent_name?: string;
          parent_contact?: string;
          date_of_birth?: string | null;
          gender?: string;
          admission_date?: string;
          status?: string;
          created_at?: string;
        };
      };
      marks: {
        Row: {
          id: string;
          student_id: string | null;
          course_id: string | null;
          internal_marks: number;
          external_marks: number;
          total_marks: number;
          grade: string;
          semester: number;
          academic_year: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id?: string | null;
          course_id?: string | null;
          internal_marks?: number;
          external_marks?: number;
          total_marks?: number;
          grade?: string;
          semester?: number;
          academic_year?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string | null;
          course_id?: string | null;
          internal_marks?: number;
          external_marks?: number;
          total_marks?: number;
          grade?: string;
          semester?: number;
          academic_year?: string;
          created_at?: string;
        };
      };
      attendance: {
        Row: {
          id: string;
          student_id: string | null;
          course_id: string | null;
          date: string;
          status: string;
          remarks: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id?: string | null;
          course_id?: string | null;
          date?: string;
          status?: string;
          remarks?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string | null;
          course_id?: string | null;
          date?: string;
          status?: string;
          remarks?: string;
          created_at?: string;
        };
      };
      fees: {
        Row: {
          id: string;
          student_id: string | null;
          amount: number;
          paid_amount: number;
          due_date: string | null;
          payment_date: string | null;
          status: string;
          fee_type: string;
          semester: number;
          academic_year: string;
          remarks: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id?: string | null;
          amount?: number;
          paid_amount?: number;
          due_date?: string | null;
          payment_date?: string | null;
          status?: string;
          fee_type?: string;
          semester?: number;
          academic_year?: string;
          remarks?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string | null;
          amount?: number;
          paid_amount?: number;
          due_date?: string | null;
          payment_date?: string | null;
          status?: string;
          fee_type?: string;
          semester?: number;
          academic_year?: string;
          remarks?: string;
          created_at?: string;
        };
      };
      events_notices: {
        Row: {
          id: string;
          title: string;
          description: string;
          type: string;
          date: string;
          attachment_url: string;
          priority: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          type?: string;
          date?: string;
          attachment_url?: string;
          priority?: string;
          created_by?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          type?: string;
          date?: string;
          attachment_url?: string;
          priority?: string;
          created_by?: string;
          created_at?: string;
        };
      };
    };
  };
}

export type Department = Database['public']['Tables']['departments']['Row'];
export type Course = Database['public']['Tables']['courses']['Row'];
export type Student = Database['public']['Tables']['students']['Row'];
export type Mark = Database['public']['Tables']['marks']['Row'];
export type Attendance = Database['public']['Tables']['attendance']['Row'];
export type Fee = Database['public']['Tables']['fees']['Row'];
export type EventNotice = Database['public']['Tables']['events_notices']['Row'];
