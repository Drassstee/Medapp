import {
  Badge,
  Card,
  Group,
  SegmentedControl,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { usePatients } from "../hooks/usePatients";
import { useState } from "react";

const PatientDatabasePage = () => {
  const [filter, setFilter] = useState<"all" | "my">("my");
  const { data: patients = [], isLoading } = usePatients(filter);

  return (
    <Stack gap="xl">
      <Stack gap={4}>
        <Title order={2}>Patient Database</Title>
        <Text c="dimmed">
          View and manage patient information. Filter to see all patients or only your assigned patients.
        </Text>
      </Stack>

      <Card radius="xl" padding="xl" withBorder>
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Text fw={600}>Patients</Text>
            <SegmentedControl
              value={filter}
              onChange={(value) => setFilter(value as "all" | "my")}
              data={[
                { label: "My Patients", value: "my" },
                { label: "All Patients", value: "all" },
              ]}
              radius="xl"
            />
          </Group>

          {isLoading ? (
            <Text c="dimmed" ta="center" py="xl">
              Loading patients...
            </Text>
          ) : patients.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              {filter === "my"
                ? "No patients assigned to you yet. Assign patients from the 'Assign Patient' page."
                : "No patients found."}
            </Text>
          ) : (
            <Table.ScrollContainer minWidth={800}>
              <Table verticalSpacing="md" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Email</Table.Th>
                    <Table.Th>Phone</Table.Th>
                    <Table.Th>Gender</Table.Th>
                    <Table.Th>Age Group</Table.Th>
                    <Table.Th>Diseases</Table.Th>
                    <Table.Th>Last Updated</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {patients.map((patient) => (
                    <Table.Tr key={patient.id}>
                      <Table.Td>
                        <Text fw={500}>{patient.fullName}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          {patient.email}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{patient.phone || "—"}</Text>
                      </Table.Td>
                      <Table.Td>
                        {patient.medicalInfo?.gender ? (
                          <Badge variant="light" color="blue">
                            {patient.medicalInfo.gender}
                          </Badge>
                        ) : (
                          <Text size="sm" c="dimmed">
                            Not set
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        {patient.medicalInfo?.ageGroup ? (
                          <Badge variant="light" color="teal">
                            {patient.medicalInfo.ageGroup}
                          </Badge>
                        ) : (
                          <Text size="sm" c="dimmed">
                            Not set
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        {patient.medicalInfo?.diseases && patient.medicalInfo.diseases.length > 0 ? (
                          <Group gap={4}>
                            {patient.medicalInfo.diseases.slice(0, 2).map((disease) => (
                              <Badge key={disease.id} variant="dot" size="sm" color="red">
                                {disease.name}
                              </Badge>
                            ))}
                            {patient.medicalInfo.diseases.length > 2 && (
                              <Badge variant="light" size="sm" color="gray">
                                +{patient.medicalInfo.diseases.length - 2}
                              </Badge>
                            )}
                          </Group>
                        ) : (
                          <Text size="sm" c="dimmed">
                            None
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        {patient.medicalInfo?.updatedAt ? (
                          <Text size="sm" c="dimmed">
                            {new Date(patient.medicalInfo.updatedAt).toLocaleDateString()}
                          </Text>
                        ) : (
                          <Text size="sm" c="dimmed">
                            Never
                          </Text>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          )}
        </Stack>
      </Card>
    </Stack>
  );
};

export default PatientDatabasePage;

