import React from 'react';

const VendorRanking = ({ vendors }) => {
  // Calcular totais
  const totalVgv = vendors ? vendors.reduce((sum, v) => sum + v.vgv, 0) : 0;
  const totalSales = vendors ? vendors.reduce((sum, v) => sum + v.vendas, 0) : 0;
  
  // A porcentagem de VGV total em relação ao VGV geral (sempre 100% ou a soma das porcentagens)
  const totalPctVgv = vendors && vendors.length > 0 ? vendors.reduce((sum, v) => sum + v.pctVgv, 0) : 0;

  const formatCurrency = (val) => {
    // Formata como moeda cheia (sem centavos) para economizar espaço e manter consistência visual
    return `R$ ${Math.round(val).toLocaleString('pt-BR')}`;
  };

  return (
    <div className="bg-[#141517] border border-border-card rounded-2xl p-5 shadow-lg flex flex-col h-full">
      {/* Título do Card */}
      <h3 className="text-xs font-bold tracking-widest text-text-secondary uppercase mb-4 text-left border-b border-[#222326] pb-2">
        Ranking de Vendedores
      </h3>

      {/* Tabela */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#222326] text-[8px] font-bold text-text-muted tracking-widest uppercase select-none">
              <th className="py-2.5">Vendedor</th>
              <th className="py-2.5 text-right"><span className="hidden sm:inline">Ranking (VGV)</span><span className="inline sm:hidden">VGV</span></th>
              <th className="py-2.5 text-right">Vendas</th>
              <th className="py-2.5 text-right">% Meta Mês</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222326] text-xs font-medium text-text-secondary">
            {vendors && vendors.length > 0 ? (
              vendors.map((vendor, idx) => (
                <tr key={vendor.name} className="hover:bg-[#1C150C]/20 transition-colors duration-150 group">
                  {/* Nome do vendedor */}
                  <td className="py-3 font-semibold text-white group-hover:text-gold-primary transition-colors">
                    {vendor.name}
                  </td>
                  
                  {/* VGV */}
                  <td className="py-3 text-right font-bold text-white mono-numbers">
                    {formatCurrency(vendor.vgv)}
                  </td>
                  
                  {/* Vendas */}
                  <td className="py-3 text-right font-semibold text-text-secondary mono-numbers">
                    {vendor.vendas}
                  </td>
                  
                  {/* % VGV */}
                  <td className="py-3 text-right font-bold text-gold-primary mono-numbers">
                    {vendor.pctVgv.toFixed(2).replace('.', ',')}%
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-8 text-center text-text-muted select-none">
                  Nenhum vendedor com vendas no período.
                </td>
              </tr>
            )}
          </tbody>
          
          {/* Rodapé da Tabela com Totais */}
          {vendors && vendors.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-[#222326] text-xs font-bold text-white bg-[#1C150C]/10 select-none">
                <td className="py-3">Total</td>
                <td className="py-3 text-right text-gold-primary mono-numbers">
                  {formatCurrency(totalVgv)}
                </td>
                <td className="py-3 text-right mono-numbers">{totalSales}</td>
                <td className="py-3 text-right text-gold-primary mono-numbers">
                  {totalPctVgv.toFixed(2).replace('.', ',')}%
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default VendorRanking;
