-- Demo data for the development deployment on testnet. Optional: the app works without it, showing
-- addresses instead of names. Replace the addresses with the identities from
-- docs/06-getting-started.md (`stellar keys address qt-admin`, and so on) before running it.

insert into public.buildings (contract_id, network, name, units)
values ('CAQ6YXC6L3G2YVBWW52IPDNVBRCDMUO3S463MQL5HD2KGNDCOT5NCHDA', 'testnet', 'Torres del Parque', 40)
on conflict (contract_id) do nothing;

-- Uncomment and fill in to show names instead of addresses:
-- insert into public.people (contract_id, address, display_name, note) values
--   ('CAQ6YXC6L3G2YVBWW52IPDNVBRCDMUO3S463MQL5HD2KGNDCOT5NCHDA', 'G...ASSEMBLY', 'Asamblea de copropietarios', null),
--   ('CAQ6YXC6L3G2YVBWW52IPDNVBRCDMUO3S463MQL5HD2KGNDCOT5NCHDA', 'G...ADMIN', 'Marta Rojas', 'Administradora'),
--   ('CAQ6YXC6L3G2YVBWW52IPDNVBRCDMUO3S463MQL5HD2KGNDCOT5NCHDA', 'G...COUNCIL1', 'Ana', 'Consejo'),
--   ('CAQ6YXC6L3G2YVBWW52IPDNVBRCDMUO3S463MQL5HD2KGNDCOT5NCHDA', 'G...COUNCIL2', 'Beto', 'Consejo'),
--   ('CAQ6YXC6L3G2YVBWW52IPDNVBRCDMUO3S463MQL5HD2KGNDCOT5NCHDA', 'G...COUNCIL3', 'Carla', 'Consejo')
-- on conflict (contract_id, address) do nothing;
