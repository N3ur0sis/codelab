export default function StudentLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="student-dashboard">
        <h1>Student Dashboard</h1>
        {children}
      </div>
    );
  }