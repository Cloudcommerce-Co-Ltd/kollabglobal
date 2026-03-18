export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  void params;
  return <div className="p-8">Campaign Detail</div>;
}
