export default function CampaignBriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  void params;
  return <div className="p-8">Campaign Brief</div>;
}
