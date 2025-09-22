"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Shield, Eye, Plus, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Address {
  address: string;
  addedAt?: string;
}

interface AddressListProps {
  addresses: Address[];
  type: "sanctions" | "mixers" | "darknet";
  onAdd: (address: string) => void;
  onRemove: (address: string) => void;
  isLoading: boolean;
}

const AddressList = ({
  addresses,
  type,
  onAdd,
  onRemove,
  isLoading,
}: AddressListProps) => {
  const [newAddress, setNewAddress] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const getIcon = () => {
    switch (type) {
      case "sanctions":
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case "mixers":
        return <Shield className="w-4 h-4 text-accent" />;
      case "darknet":
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case "sanctions":
        return "Sanctioned Addresses";
      case "mixers":
        return "Mixer Addresses";
      case "darknet":
        return "Darknet Addresses";
    }
  };

  const getVariant = () => {
    switch (type) {
      case "sanctions":
        return "destructive" as const;
      case "mixers":
        return "secondary" as const;
      case "darknet":
        return "destructive" as const;
    }
  };

  const filteredAddresses = addresses.filter((addr) =>
    addr.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    if (newAddress.trim()) {
      onAdd(newAddress.trim());
      setNewAddress("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getIcon()}
          {getTitle()}
        </CardTitle>
        <CardDescription>
          Manage {type} addresses for AML compliance monitoring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new address */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor={`${type}-address`} className="sr-only">
              New {type} address
            </Label>
            <Input
              id={`${type}-address`}
              placeholder={`Enter ${type} address...`}
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>
          <Button
            onClick={handleAdd}
            disabled={!newAddress.trim() || isLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search addresses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Address list */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredAddresses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {searchTerm
                  ? "No addresses match your search"
                  : `No ${type} addresses added yet`}
              </p>
            </div>
          ) : (
            filteredAddresses.map((addr) => (
              <div
                key={addr.address}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getVariant()} className="text-xs">
                      {type.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm font-mono text-foreground break-all">
                    {addr.address}
                  </p>
                  {addr.addedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Added: {new Date(addr.addedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(addr.address)}
                  disabled={isLoading}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          Total: {addresses.length} addresses
        </div>
      </CardContent>
    </Card>
  );
};

export default function AddressManagement() {
  const [sanctionedAddresses, setSanctionedAddresses] = useState<Address[]>([]);
  const [mixerAddresses, setMixerAddresses] = useState<Address[]>([]);
  const [darknetAddresses, setDarknetAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load addresses on component mount
  useEffect(() => {
    loadAllAddresses();
  }, []);

  const loadAllAddresses = async () => {
    setIsLoading(true);
    try {
      const [sanctions, mixers, darknet] = await Promise.all([
        axios
          .get("http://localhost:8080/sanctions/all")
          .then((res) => res.data),
        axios.get("http://localhost:8080/mixers/all").then((res) => res.data),
        axios.get("http://localhost:8080/darknet/all").then((res) => res.data),
      ]);

      setSanctionedAddresses(
        sanctions.sanctioned?.map((addr: string) => ({ address: addr })) || []
      );
      setMixerAddresses(
        mixers.mixers?.map((addr: string) => ({ address: addr })) || []
      );
      setDarknetAddresses(
        darknet.darknet?.map((addr: string) => ({ address: addr })) || []
      );
    } catch (error) {
      toast({
        title: "Error",
        description:
          "Failed to load addresses. Please check your API connection.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addAddress = async (
    type: "sanctions" | "mixers" | "darknet",
    address: string
  ) => {
    setIsLoading(true);
    try {
      let url = "";
      if (type === "sanctions") url = "http://localhost:8080/sanctions/add";
      if (type === "mixers") url = "http://localhost:8080/mixers/add";
      if (type === "darknet") url = "http://localhost:8080/darknet/add";
      await axios.post(url, { address });
      const newAddress = { address, addedAt: new Date().toISOString() };
      switch (type) {
        case "sanctions":
          setSanctionedAddresses((prev) => [...prev, newAddress]);
          break;
        case "mixers":
          setMixerAddresses((prev) => [...prev, newAddress]);
          break;
        case "darknet":
          setDarknetAddresses((prev) => [...prev, newAddress]);
          break;
      }
      toast({
        title: "Success",
        description: `Address added to ${type} list successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to add address to ${type} list.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeAddress = async (
    type: "sanctions" | "mixers" | "darknet",
    address: string
  ) => {
    setIsLoading(true);
    try {
      // Note: API doesn't have remove endpoints, so we'll just remove from local state
      // In a real implementation, you'd call DELETE /api/${type}/${address}

      switch (type) {
        case "sanctions":
          setSanctionedAddresses((prev) =>
            prev.filter((addr) => addr.address !== address)
          );
          break;
        case "mixers":
          setMixerAddresses((prev) =>
            prev.filter((addr) => addr.address !== address)
          );
          break;
        case "darknet":
          setDarknetAddresses((prev) =>
            prev.filter((addr) => addr.address !== address)
          );
          break;
      }

      toast({
        title: "Success",
        description: `Address removed from ${type} list.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to remove address from ${type} list.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Address Management
          </h2>
          <p className="text-muted-foreground">
            Manage sanctioned, mixer, and darknet addresses for AML compliance
          </p>
        </div>
        <Button onClick={loadAllAddresses} disabled={isLoading}>
          <Search className="w-4 h-4 mr-2" />
          Refresh All
        </Button>
      </div>

      <Tabs defaultValue="sanctions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sanctions" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Sanctions ({sanctionedAddresses.length})
          </TabsTrigger>
          <TabsTrigger value="mixers" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Mixers ({mixerAddresses.length})
          </TabsTrigger>
          <TabsTrigger value="darknet" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Darknet ({darknetAddresses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sanctions">
          <AddressList
            addresses={sanctionedAddresses}
            type="sanctions"
            onAdd={(address) => addAddress("sanctions", address)}
            onRemove={(address) => removeAddress("sanctions", address)}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="mixers">
          <AddressList
            addresses={mixerAddresses}
            type="mixers"
            onAdd={(address) => addAddress("mixers", address)}
            onRemove={(address) => removeAddress("mixers", address)}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="darknet">
          <AddressList
            addresses={darknetAddresses}
            type="darknet"
            onAdd={(address) => addAddress("darknet", address)}
            onRemove={(address) => removeAddress("darknet", address)}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
