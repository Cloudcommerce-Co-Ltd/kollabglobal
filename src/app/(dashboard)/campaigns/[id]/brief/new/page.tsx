export default function CreateBriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  void params;
  return <div className="p-8">Create Brief</div>;
}
