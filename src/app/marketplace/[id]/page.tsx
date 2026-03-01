export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">商品详情</h1>
      <p className="mt-2 text-muted-foreground">商品 ID: {id}</p>
    </div>
  );
}
