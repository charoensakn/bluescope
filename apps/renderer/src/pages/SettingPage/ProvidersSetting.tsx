import AddIcon from '@mui/icons-material/Add';
import KeyIcon from '@mui/icons-material/Key';
import { Button, Stack } from '@mui/material';
import type { Provider } from '@repo/modules';
import { useState } from 'react';
import useSWR from 'swr';
import { PaperWithHeader } from '../../components';
import { Empty } from '../../components/Empty';
import fetcher from '../../fetcher';
import { useUIStore } from '../../hooks';
import { m } from '../../paraglide/messages';
import { ProviderCard } from './ProviderCard';
import { ProviderDialog } from './ProviderDialog';

export function ProvidersSetting() {
  const [open, setOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const locale = useUIStore((state) => state.uiLocale);
  const { data, mutate } = useSWR<Provider[]>('provider:getAll', fetcher);

  const handleUpdateProvider = async (provider: Provider) => {
    await window.provider.put(provider);
    mutate();
  };

  const handleDeleteProvider = async (provider: Provider) => {
    await window.provider.remove(provider.id);
    mutate();
  };

  const handleMakeDefault = async (provider: Provider) => {
    await window.provider.markDefault(provider.id);
    mutate();
  };

  const handleMoveUp = async (provider: Provider) => {
    await window.provider.moveUp(provider.id);
    mutate();
  };

  const handleMoveDown = async (provider: Provider) => {
    await window.provider.moveDown(provider.id);
    mutate();
  };

  return (
    <>
      <PaperWithHeader
        icon={<KeyIcon color="primary" />}
        title={m.setting_providers(undefined, { locale })}
        subtitle={m.setting_providers_description(undefined, { locale })}
        controls={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedProvider(null);
              setOpen(true);
            }}
          >
            {m.setting_add_provider(undefined, { locale })}
          </Button>
        }
      >
        {data?.length ? (
          <Stack spacing={1}>
            {data?.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                onEditClick={() => {
                  setSelectedProvider(provider);
                  setOpen(true);
                }}
                onDeleteClick={() => handleDeleteProvider(provider)}
                onDownClick={() => handleMoveDown(provider)}
                onUpClick={() => handleMoveUp(provider)}
                onMakeDefaultClick={() => handleMakeDefault(provider)}
              />
            ))}
          </Stack>
        ) : (
          <Empty />
        )}
      </PaperWithHeader>
      <ProviderDialog
        open={open}
        provider={selectedProvider}
        onCancel={() => setOpen(false)}
        onAddProvider={handleUpdateProvider}
      />
    </>
  );
}
