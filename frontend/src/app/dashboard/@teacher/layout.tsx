export default function TeacherLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="teacher-dashboard">
        <h1>Teacher Dashboard</h1>
        {children}
      </div>
    );
  }