export default function CreateBriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  void params;
  return <div className="p-4 sm:p-6 lg:p-8">Create Brief</div>;
}
